import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Creating initial versions for existing SOPs...')

  // Get all existing SOPs
  const sops = await prisma.sop.findMany()

  for (const sop of sops) {
    // Check if this SOP already has versions
    const existingVersionCount = await prisma.sopVersion.count({
      where: { sopId: sop.id }
    })

    if (existingVersionCount === 0) {
      // Create initial version
      await prisma.sopVersion.create({
        data: {
          sopId: sop.id,
          version: sop.version,
          title: sop.title,
          description: sop.description,
          content: sop.content,
          pdfUrl: sop.pdfUrl,
          pdfFileName: sop.pdfFileName,
          changelog: 'Initial version',
          createdBy: 'System',
          createdAt: sop.createdAt,
        }
      })
      console.log(`✅ Created initial version for: ${sop.title} (${sop.version})`)
    } else {
      console.log(`⏭️  Skipping ${sop.title} - already has ${existingVersionCount} version(s)`)
    }
  }

  console.log('🎉 Initial version creation completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error creating initial versions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

