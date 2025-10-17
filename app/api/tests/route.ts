import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST create competency test (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sopId, title, passingScore, questions } = body

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

    const test = await prisma.competencyTest.create({
      data: {
        sopId,
        title,
        passingScore: passingScore || 100,
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

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}


