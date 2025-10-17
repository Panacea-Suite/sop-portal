import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET assignments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const whereClause = session.user.role === 'ADMIN' && userId
      ? { userId }
      : { userId: session.user.id }

    const assignments = await prisma.sopAssignment.findMany({
      where: whereClause,
      include: {
        sop: {
          include: {
            test: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

// POST create assignment (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, sopId, dueDate } = body

    // Check if the SOP has a competency test
    const sop = await prisma.sop.findUnique({
      where: { id: sopId },
      include: { test: true }
    })

    if (!sop) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    if (!sop.test) {
      return NextResponse.json({ 
        error: 'Cannot assign SOP without a competency test. Please create a test first.' 
      }, { status: 400 })
    }

    // Check if test has enough questions
    const testWithQuestions = await prisma.competencyTest.findUnique({
      where: { id: sop.test.id },
      include: { questions: true }
    })

    if (!testWithQuestions || testWithQuestions.questions.length < 9) {
      return NextResponse.json({ 
        error: `Test must have at least 9 questions before assignment. Current: ${testWithQuestions?.questions.length || 0} questions.` 
      }, { status: 400 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.sopAssignment.findUnique({
      where: {
        userId_sopId: {
          userId,
          sopId,
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json({ error: 'Assignment already exists' }, { status: 400 })
    }

    const assignment = await prisma.sopAssignment.create({
      data: {
        userId,
        sopId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedBy: session.user.id, // Track who assigned this
      },
      include: {
        sop: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}




