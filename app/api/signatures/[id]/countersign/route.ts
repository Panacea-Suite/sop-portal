import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST admin counter-signs
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { signature, agreedToDeclaration } = body

    // Validate inputs
    if (!signature || !agreedToDeclaration) {
      return NextResponse.json({ 
        error: 'Signature and agreement to declaration are required' 
      }, { status: 400 })
    }

    // Get signature record
    const sopSignature = await prisma.sopSignature.findUnique({
      where: { id: params.id },
      include: {
        assignment: true,
      }
    })

    if (!sopSignature) {
      return NextResponse.json({ error: 'Signature record not found' }, { status: 404 })
    }

    // Verify it's awaiting admin signature
    if (sopSignature.assignment.status !== 'AWAITING_ADMIN_SIGNATURE') {
      return NextResponse.json({ 
        error: 'This signature is not awaiting admin counter-signature' 
      }, { status: 400 })
    }

    // Verify admin signature matches their name (case-insensitive)
    if (signature.trim().toLowerCase() !== session.user.name.trim().toLowerCase()) {
      return NextResponse.json({ 
        error: 'Signature must match your full name exactly' 
      }, { status: 400 })
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Update signature with admin counter-signature
    const updatedSignature = await prisma.sopSignature.update({
      where: { id: params.id },
      data: {
        adminSignature: signature.trim(),
        adminSignedBy: session.user.id,
        adminSignedAt: new Date(),
        adminIpAddress: ip,
      }
    })

    // Update assignment status to COMPLETED
    await prisma.sopAssignment.update({
      where: { id: sopSignature.assignmentId },
      data: {
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      signature: updatedSignature,
      message: 'Counter-signature submitted successfully. Training completion verified.'
    })
  } catch (error) {
    console.error('Failed to counter-sign:', error)
    return NextResponse.json({ error: 'Failed to counter-sign' }, { status: 500 })
  }
}

