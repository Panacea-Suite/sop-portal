import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all versions for a specific SOP (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const versions = await prisma.sopVersion.findMany({
      where: { sopId: params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        version: true,
        title: true,
        changelog: true,
        createdBy: true,
        createdAt: true,
      }
    })

    // Also get current SOP version
    const currentSop = await prisma.sop.findUnique({
      where: { id: params.id },
      select: {
        version: true,
        title: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      versions,
      currentVersion: currentSop?.version,
    })
  } catch (error) {
    console.error('Failed to fetch versions:', error)
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
  }
}

