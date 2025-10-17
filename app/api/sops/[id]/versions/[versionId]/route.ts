import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { incrementVersion } from '@/lib/versionHelpers'
import { sendVersionUpdateEmail } from '@/lib/email'

// GET specific version details (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const version = await prisma.sopVersion.findUnique({
      where: { id: params.versionId }
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error('Failed to fetch version:', error)
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 })
  }
}

// POST restore a specific version (admin only)
export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the version to restore
    const versionToRestore = await prisma.sopVersion.findUnique({
      where: { id: params.versionId }
    })

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Get current SOP
    const currentSop = await prisma.sop.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!currentSop) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    // Archive current version
    await prisma.sopVersion.create({
      data: {
        sopId: currentSop.id,
        version: currentSop.version,
        title: currentSop.title,
        description: currentSop.description,
        content: currentSop.content,
        pdfUrl: currentSop.pdfUrl,
        pdfFileName: currentSop.pdfFileName,
        changelog: 'Archived before restoration',
        createdBy: session.user.name || session.user.email,
      }
    })

    // Increment version for the restored content
    const newVersion = incrementVersion(currentSop.version)

    // Update SOP with restored data
    const updatedSop = await prisma.sop.update({
      where: { id: params.id },
      data: {
        title: versionToRestore.title,
        description: versionToRestore.description,
        content: versionToRestore.content,
        pdfUrl: versionToRestore.pdfUrl,
        pdfFileName: versionToRestore.pdfFileName,
        version: newVersion,
      }
    })

    // Create version record for restored version
    await prisma.sopVersion.create({
      data: {
        sopId: updatedSop.id,
        version: newVersion,
        title: versionToRestore.title,
        description: versionToRestore.description,
        content: versionToRestore.content,
        pdfUrl: versionToRestore.pdfUrl,
        pdfFileName: versionToRestore.pdfFileName,
        changelog: `Restored from version ${versionToRestore.version}`,
        createdBy: session.user.name || session.user.email,
      }
    })

    // Reassign all users
    const userIds = [...new Set(currentSop.assignments.map(a => a.userId))]
    
    const usersToNotify = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })
    
    let reassignmentCount = 0
    let emailsSentCount = 0
    let emailsFailedCount = 0
    
    for (const userId of userIds) {
      await prisma.sopAssignment.deleteMany({
        where: {
          userId,
          sopId: currentSop.id
        }
      })
      
      await prisma.sopAssignment.create({
        data: {
          userId,
          sopId: currentSop.id,
          status: 'PENDING',
          assignedBy: session.user.id,
        }
      })
      
      reassignmentCount++
      
      // Send email notification
      const user = usersToNotify.find(u => u.id === userId)
      if (user) {
        try {
          const emailResult = await sendVersionUpdateEmail({
            to: user.email,
            name: user.name,
            sopTitle: versionToRestore.title,
            oldVersion: currentSop.version,
            newVersion,
            changelog: `Restored from version ${versionToRestore.version}`,
          })
          
          if (emailResult.success) {
            emailsSentCount++
            console.log(`✅ Version update email sent to ${user.email}`)
          } else {
            emailsFailedCount++
            console.error(`❌ Failed to send email to ${user.email}`)
          }
        } catch (emailError) {
          emailsFailedCount++
          console.error(`❌ Email error for ${user.email}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      sop: updatedSop,
      newVersion,
      restoredFrom: versionToRestore.version,
      reassignmentCount,
      emailsSent: emailsSentCount,
      emailsFailed: emailsFailedCount,
      message: `Version ${newVersion} created from ${versionToRestore.version}. ${reassignmentCount} users reassigned. ${emailsSentCount} email notifications sent.`
    })
  } catch (error) {
    console.error('Failed to restore version:', error)
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 })
  }
}

