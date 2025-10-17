import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET test with questions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.competencyTest.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 })
  }
}

// PUT update test (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, passingScore, questions } = body

    // Validate question count
    if (!questions || questions.length < 9) {
      return NextResponse.json({ 
        error: 'Minimum 9 questions required for competency tests' 
      }, { status: 400 })
    }

    if (questions.length > 20) {
      return NextResponse.json({ 
        error: 'Maximum 20 questions allowed per test' 
      }, { status: 400 })
    }

    // Check if test has existing results (for warning purposes)
    const existingResults = await prisma.testResult.count({
      where: { testId: params.id }
    })

    // Delete existing questions
    await prisma.testQuestion.deleteMany({
      where: { testId: params.id }
    })

    // Update test and create new questions
    const test = await prisma.competencyTest.update({
      where: { id: params.id },
      data: {
        title,
        passingScore,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            options: q.options, // PostgreSQL handles JSON natively
            correctAnswer: q.correctAnswer,
            order: index,
          }))
        }
      },
      include: {
        questions: true,
      }
    })

    return NextResponse.json({
      test,
      warning: existingResults > 0 ? `This test has ${existingResults} existing result(s). Historical results may reference deleted questions.` : null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

// DELETE test (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.competencyTest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}


