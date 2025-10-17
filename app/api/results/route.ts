import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET test results
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let whereClause: any = {}
    
    if (session.user.role === 'ADMIN') {
      // Admin can see all results, or filter by userId if provided
      if (userId) {
        whereClause = { userId }
      }
      // If no userId, show all results (empty whereClause)
    } else {
      // Regular users can only see their own results
      whereClause = { userId: session.user.id }
    }

    const results = await prisma.testResult.findMany({
      where: whereClause,
      include: {
        test: {
          include: {
            sop: true,
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
      orderBy: { completedAt: 'desc' }
    })

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
