import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAssignmentNotificationEmail } from '@/lib/email'

// POST batch create assignments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, sopIds } = body

    if (!userId || !Array.isArray(sopIds) || sopIds.length === 0) {
      return NextResponse.json({ 
        error: 'userId and sopIds array are required' 
      }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []
    const successfulSopIds: string[] = []

    // Create assignments
    for (const sopId of sopIds) {
      try {
        // Check if SOP has test with enough questions
        const sop = await prisma.sop.findUnique({
          where: { id: sopId },
          include: { test: { include: { questions: true } } }
        })

        if (!sop) {
          failedCount++
          errors.push(`SOP not found`)
          continue
        }

        if (!sop.test) {
          failedCount++
          errors.push(`${sop.title}: No competency test`)
          continue
        }

        if (sop.test.questions.length < 9) {
          failedCount++
          errors.push(`${sop.title}: Test needs ${9 - sop.test.questions.length} more questions`)
          continue
        }

        // Check if already assigned
        const existing = await prisma.sopAssignment.findUnique({
          where: {
            userId_sopId: {
              userId,
              sopId
            }
          }
        })

        if (existing) {
          failedCount++
          errors.push(`${sop.title}: Already assigned`)
          continue
        }

        // Create assignment
        await prisma.sopAssignment.create({
          data: {
            userId,
            sopId,
            assignedBy: session.user.id,
          }
        })

        successCount++
        successfulSopIds.push(sopId)
      } catch (error) {
        failedCount++
        errors.push('Assignment error')
      }
    }

    // Send email if any assignments succeeded
    if (successCount > 0 && successfulSopIds.length > 0) {
      try {
        // Fetch full SOP details for successful assignments
        const assignedSops = await prisma.sop.findMany({
          where: {
            id: { in: successfulSopIds }
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            version: true,
          }
        })

        // Get due dates from assignments
        const assignments = await prisma.sopAssignment.findMany({
          where: {
            userId,
            sopId: { in: successfulSopIds }
          },
          select: {
            sopId: true,
            dueDate: true,
          }
        })

        // Combine SOP details with due dates
        const sopsWithDueDates = assignedSops.map(sop => {
          const assignment = assignments.find(a => a.sopId === sop.id)
          return {
            title: sop.title,
            description: sop.description,
            category: sop.category ?? undefined,
            version: sop.version,
            dueDate: assignment?.dueDate ?? undefined,
          }
        })

        // Send email
        const emailResult = await sendAssignmentNotificationEmail({
          to: user.email,
          userName: user.name,
          sops: sopsWithDueDates,
        })

        if (!emailResult.success) {
          console.error('Failed to send assignment notification email')
        }
      } catch (emailError) {
        console.error('Error sending assignment email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      successCount,
      failedCount,
      errors,
      message: `Successfully assigned ${successCount} SOP${successCount > 1 ? 's' : ''}${failedCount > 0 ? `. ${failedCount} failed.` : ''}`
    })
  } catch (error) {
    console.error('Batch assignment error:', error)
    return NextResponse.json({ error: 'Failed to create assignments' }, { status: 500 })
  }
}

