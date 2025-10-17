import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { incrementVersion } from '@/lib/versionHelpers'
import { sendVersionUpdateEmail } from '@/lib/email'
import { selectRandomQuestions, calculateAttemptNumber } from '@/lib/questionRandomizer'

// GET single SOP
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sop = await prisma.sop.findUnique({
      where: { id: params.id },
      include: {
        test: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!sop) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    // Check if user has access (admin or assigned user)
    if (session.user.role !== 'ADMIN') {
      const assignment = await prisma.sopAssignment.findFirst({
        where: {
          userId: session.user.id,
          sopId: params.id,
        }
      })

      if (!assignment) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // For non-admin users taking the test, randomize questions
      if (sop.test && sop.test.questions.length >= 3) {
        // Calculate attempt number
        const previousAttempts = await prisma.testResult.count({
          where: {
            userId: session.user.id,
            testId: sop.test.id
          }
        })
        const attemptNumber = calculateAttemptNumber(previousAttempts)

        // Select 3 random questions using deterministic randomization
        const randomizedQuestions = selectRandomQuestions(
          sop.test.questions,
          session.user.id,
          attemptNumber,
          sop.test.id,
          3
        )

        // Replace test questions with randomized subset
        sop.test.questions = randomizedQuestions
      }
    }

    return NextResponse.json(sop)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SOP' }, { status: 500 })
  }
}

// POST create new version (admin only)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, content, pdfUrl, pdfFileName, category, changelog } = body

    // Get current SOP data
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

    // Create version record for current state
    await prisma.sopVersion.create({
      data: {
        sopId: currentSop.id,
        version: currentSop.version,
        title: currentSop.title,
        description: currentSop.description,
        content: currentSop.content,
        pdfUrl: currentSop.pdfUrl,
        pdfFileName: currentSop.pdfFileName,
        changelog: 'Previous version archived',
        createdBy: session.user.name || session.user.email,
      }
    })

    // Increment version
    const newVersion = incrementVersion(currentSop.version)

    // Update SOP with new data
    const updatedSop = await prisma.sop.update({
      where: { id: params.id },
      data: {
        title,
        description,
        content,
        pdfUrl,
        pdfFileName,
        category,
        version: newVersion,
      }
    })

    // Create version record for new version
    await prisma.sopVersion.create({
      data: {
        sopId: updatedSop.id,
        version: newVersion,
        title,
        description,
        content,
        pdfUrl,
        pdfFileName,
        changelog: changelog || 'Updated version',
        createdBy: session.user.name || session.user.email,
      }
    })

    // Get all unique user IDs who have assignments and fetch full user details
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
    
    // Create new PENDING assignments for all users
    let reassignmentCount = 0
    let emailsSentCount = 0
    let emailsFailedCount = 0
    
    for (const userId of userIds) {
      // Delete old assignment
      await prisma.sopAssignment.deleteMany({
        where: {
          userId,
          sopId: currentSop.id
        }
      })
      
      // Create new PENDING assignment
      await prisma.sopAssignment.create({
        data: {
          userId,
          sopId: currentSop.id,
          status: 'PENDING',
          assignedBy: session.user.id, // Track who created the new version
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
            sopTitle: title,
            oldVersion: currentSop.version,
            newVersion,
            changelog: changelog || 'Updated version',
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
      reassignmentCount,
      emailsSent: emailsSentCount,
      emailsFailed: emailsFailedCount,
      message: `Version ${newVersion} created successfully. ${reassignmentCount} users reassigned. ${emailsSentCount} email notifications sent.`
    })
  } catch (error) {
    console.error('Failed to create new version:', error)
    return NextResponse.json({ error: 'Failed to create new version' }, { status: 500 })
  }
}

// DELETE SOP (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if SOP exists
    const sop = await prisma.sop.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            assignments: true,
            versions: true,
            signatures: true,
          }
        }
      }
    })

    if (!sop) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    // Delete the SOP (cascade will handle related records)
    await prisma.sop.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'SOP deleted successfully',
      deleted: {
        sop: sop.title,
        assignments: sop._count.assignments,
        versions: sop._count.versions,
        signatures: sop._count.signatures
      }
    })
  } catch (error) {
    console.error('Failed to delete SOP:', error)
    return NextResponse.json({ 
      error: 'Failed to delete SOP',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
