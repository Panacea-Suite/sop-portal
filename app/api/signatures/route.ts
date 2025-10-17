import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendCounterSignRequestEmail } from '@/lib/email'

// POST create user signature
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignmentId, signature, agreedToDeclaration } = body

    // Validate inputs
    if (!signature || !agreedToDeclaration) {
      return NextResponse.json({ 
        error: 'Signature and agreement to declaration are required' 
      }, { status: 400 })
    }

    // Get assignment with related data
    const assignment = await prisma.sopAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        sop: true,
        user: true,
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify user owns this assignment
    if (assignment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify assignment is in correct status
    if (assignment.status !== 'AWAITING_USER_SIGNATURE') {
      return NextResponse.json({ 
        error: 'Assignment is not awaiting user signature' 
      }, { status: 400 })
    }

    // Verify signature matches user name (case-insensitive)
    if (signature.trim().toLowerCase() !== assignment.user.name.trim().toLowerCase()) {
      return NextResponse.json({ 
        error: 'Signature must match your full name exactly' 
      }, { status: 400 })
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Create signature record
    const sopSignature = await prisma.sopSignature.create({
      data: {
        assignmentId: assignment.id,
        userId: assignment.userId,
        sopId: assignment.sopId,
        sopVersion: assignment.sop.version,
        userSignature: signature.trim(),
        userSignedAt: new Date(),
        userIpAddress: ip,
      }
    })

    // Update assignment status
    await prisma.sopAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'AWAITING_ADMIN_SIGNATURE'
      }
    })

    // Send email to assigning admin if exists
    if (assignment.assignedByUser) {
      try {
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

        await sendCounterSignRequestEmail({
          to: assignment.assignedByUser.email,
          adminName: assignment.assignedByUser.name,
          userName: assignment.user.name,
          userEmail: assignment.user.email,
          sopTitle: assignment.sop.title,
          sopVersion: assignment.sop.version,
          testScore: testResult?.score || 0,
          userSignature: signature.trim(),
          signedAt: sopSignature.userSignedAt!,
        })
        console.log(`✅ Counter-sign request email sent to ${assignment.assignedByUser.email}`)
      } catch (emailError) {
        console.error('❌ Failed to send counter-sign request email:', emailError)
        // Don't fail the signature creation if email fails
      }
    }

    return NextResponse.json({
      signature: sopSignature,
      message: 'Signature submitted successfully. Awaiting admin counter-signature.'
    })
  } catch (error) {
    console.error('Failed to create signature:', error)
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 })
  }
}

// GET all signatures (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const signatures = await prisma.sopSignature.findMany({
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
          }
        },
        assignment: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(signatures)
  } catch (error) {
    console.error('Failed to fetch signatures:', error)
    return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 })
  }
}

