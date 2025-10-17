import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all signatures awaiting admin counter-signature
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all assignments that are awaiting admin signature
    const pendingAssignments = await prisma.sopAssignment.findMany({
      where: {
        status: 'AWAITING_ADMIN_SIGNATURE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        sop: {
          select: {
            id: true,
            title: true,
            version: true,
            category: true,
          }
        },
        signature: true,
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get test results for each
    const pendingWithResults = await Promise.all(
      pendingAssignments.map(async (assignment) => {
        const testResult = await prisma.testResult.findFirst({
          where: {
            userId: assignment.userId,
            test: {
              sopId: assignment.sopId
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        })

        return {
          ...assignment,
          testResult
        }
      })
    )

    return NextResponse.json(pendingWithResults)
  } catch (error) {
    console.error('Failed to fetch pending counter-signatures:', error)
    return NextResponse.json({ error: 'Failed to fetch pending counter-signatures' }, { status: 500 })
  }
}

