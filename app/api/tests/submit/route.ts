import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST submit test answers
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testId, answers, questionsShown } = body

    // Get test with questions
    const test = await prisma.competencyTest.findUnique({
      where: { id: testId },
      include: {
        questions: true,
        sop: true,
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Calculate attempt number
    const previousAttempts = await prisma.testResult.count({
      where: {
        userId: session.user.id,
        testId
      }
    })
    const attemptNumber = previousAttempts + 1

    // If questionsShown provided, only check those questions
    // Otherwise check all questions (backwards compatibility)
    const questionsToCheck = questionsShown && Array.isArray(questionsShown)
      ? test.questions.filter(q => questionsShown.includes(q.id))
      : test.questions

    // Calculate score
    let correctAnswers = 0
    questionsToCheck.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / questionsToCheck.length) * 100)
    const passed = score >= test.passingScore

    // Get SOP version
    const sopVersion = test.sop?.version || '1.0'

    // Save result
    const result = await prisma.testResult.create({
      data: {
        userId: session.user.id,
        testId,
        score,
        passed,
        answers, // PostgreSQL handles JSON natively
        sopVersion,
        questionsShown: questionsShown || test.questions.map(q => q.id),
        attemptNumber,
      }
    })

    // Update assignment status if passed
    if (passed) {
      // Get the assignment to return its ID
      const assignment = await prisma.sopAssignment.findFirst({
        where: {
          userId: session.user.id,
          sopId: test.sopId,
        }
      })

      if (assignment) {
        await prisma.sopAssignment.update({
          where: { id: assignment.id },
          data: {
            status: 'AWAITING_USER_SIGNATURE',
          }
        })
      }

      return NextResponse.json({
        result,
        score,
        passed,
        passingScore: test.passingScore,
        correctAnswers,
        totalQuestions: test.questions.length,
        requiresSignature: true,
        assignmentId: assignment?.id,
      })
    }

    // Failed test - no signature required
    return NextResponse.json({
      result,
      score,
      passed,
      passingScore: test.passingScore,
      correctAnswers,
      totalQuestions: test.questions.length,
      requiresSignature: false,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}


