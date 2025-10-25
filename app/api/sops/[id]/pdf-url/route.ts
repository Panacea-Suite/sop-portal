import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@/lib/prisma'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// GET signed URL for PDF (authenticated users only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the SOP from database
    const sop = await prisma.sop.findUnique({
      where: { id: params.id },
      select: { pdfUrl: true, title: true }
    })

    if (!sop || !sop.pdfUrl) {
      return NextResponse.json({ error: 'SOP or PDF not found' }, { status: 404 })
    }

    // Extract filename from S3 URL
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'sop-portal-assets-dev'
    const s3UrlPattern = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/`
    
    if (!sop.pdfUrl.startsWith(s3UrlPattern)) {
      // If it's not an S3 URL (old local path), return as-is
      return NextResponse.json({ url: sop.pdfUrl }, { status: 200 })
    }

    const filename = sop.pdfUrl.replace(s3UrlPattern, '')

    // Generate pre-signed URL (valid for 15 minutes)
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 minutes
    })

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 900,
    }, { status: 200 })

  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json({ 
      error: 'Failed to generate PDF URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
