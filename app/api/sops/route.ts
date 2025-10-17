import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all SOPs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (session.user.role === 'ADMIN') {
      // Admin can see all SOPs
      const sops = await prisma.sop.findMany({
        include: {
          test: {
            include: {
              questions: true
            }
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('Admin fetched SOPs:', sops.length)
      return NextResponse.json(sops)
    } else {
      // Users can only see assigned SOPs
      const assignments = await prisma.sopAssignment.findMany({
        where: { userId: session.user.id },
        include: {
          sop: {
            include: {
              test: true,
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      })
      return NextResponse.json(assignments)
    }
  } catch (error) {
    console.error('API /sops error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch SOPs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST create new SOP (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, content, pdfUrl, pdfFileName, category, version } = body

    const sop = await prisma.sop.create({
      data: {
        title,
        description,
        content,
        pdfUrl,
        pdfFileName,
        category,
        version: version || '1.0',
      }
    })

    return NextResponse.json(sop, { status: 201 })
  } catch (error) {
    console.error('API /sops POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to create SOP',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
