import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET statistics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    if (session.user.role === 'ADMIN') {
      // Admin stats - all users
      const totalUsers = await prisma.user.count({ where: { role: 'USER' } })
      const totalSOPs = await prisma.sop.count()
      const totalAssignments = await prisma.sopAssignment.count()
      const completedAssignments = await prisma.sopAssignment.count({
        where: { status: 'COMPLETED' }
      })
      const pendingAssignments = await prisma.sopAssignment.count({
        where: { status: 'PENDING' }
      })
      const totalTests = await prisma.testResult.count()
      const passedTests = await prisma.testResult.count({
        where: { passed: true }
      })

      return NextResponse.json({
        totalUsers,
        totalSOPs,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        totalTests,
        passedTests,
        averagePassRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      })
    } else {
      // User stats
      const totalAssignments = await prisma.sopAssignment.count({
        where: { userId }
      })
      const completedAssignments = await prisma.sopAssignment.count({
        where: { userId, status: 'COMPLETED' }
      })
      const pendingAssignments = await prisma.sopAssignment.count({
        where: { userId, status: 'PENDING' }
      })
      const inProgressAssignments = await prisma.sopAssignment.count({
        where: { userId, status: 'IN_PROGRESS' }
      })
      const totalTests = await prisma.testResult.count({
        where: { userId }
      })
      const passedTests = await prisma.testResult.count({
        where: { userId, passed: true }
      })

      const results = await prisma.testResult.findMany({
        where: { userId }
      })
      const averageScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0

      return NextResponse.json({
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        inProgressAssignments,
        totalTests,
        passedTests,
        averageScore,
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}




