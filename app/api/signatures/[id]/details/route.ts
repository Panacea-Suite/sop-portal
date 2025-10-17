import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET signature details by assignment ID (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find signature by assignment ID
    const signature = await prisma.sopSignature.findUnique({
      where: { assignmentId: params.id },
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
            category: true,
          }
        },
        assignment: {
          select: {
            id: true,
            status: true,
            assignedAt: true,
          }
        }
      }
    })

    if (!signature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 })
    }

    return NextResponse.json(signature)
  } catch (error) {
    console.error('Failed to fetch signature details:', error)
    return NextResponse.json({ error: 'Failed to fetch signature details' }, { status: 500 })
  }
}

