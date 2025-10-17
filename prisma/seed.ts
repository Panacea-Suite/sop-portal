import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Doe',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('✅ Created user:', user.email)

  // Create another user
  const user2Password = await bcrypt.hash('user123', 10)
  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: user2Password,
      role: 'USER',
    },
  })
  console.log('✅ Created user:', user2.email)

  // Create SOPs
  const sop1 = await prisma.sop.create({
    data: {
      title: 'Workplace Safety Procedures',
      description: 'Essential safety guidelines for all staff members',
      content: `# Workplace Safety Procedures

## Introduction
This SOP outlines the fundamental safety procedures that all staff members must follow to maintain a safe working environment.

## Personal Protective Equipment (PPE)
1. Always wear appropriate PPE for your work area
2. Inspect PPE before each use
3. Report damaged equipment immediately
4. Store PPE properly when not in use

## Emergency Procedures
1. Know the location of all emergency exits
2. Familiarize yourself with fire extinguisher locations
3. In case of fire, activate the alarm and evacuate immediately
4. Report all accidents and near-misses to your supervisor

## General Safety Rules
1. Keep work areas clean and organized
2. Report any safety hazards immediately
3. Never bypass safety guards or devices
4. Follow proper lifting techniques
5. Use appropriate tools for each task

## Conclusion
Compliance with these safety procedures is mandatory. Failure to follow these guidelines may result in disciplinary action.`,
      category: 'Safety',
      version: '1.0',
    },
  })
  console.log('✅ Created SOP:', sop1.title)

  // Create test for SOP 1
  const test1 = await prisma.competencyTest.create({
    data: {
      sopId: sop1.id,
      title: 'Workplace Safety Knowledge Test',
      passingScore: 80,
      questions: {
        create: [
          {
            question: 'What should you do if you notice damaged PPE?',
            options: [
              'Continue using it',
              'Report it immediately',
              'Try to fix it yourself',
              'Ignore it',
            ],
            correctAnswer: 'Report it immediately',
            order: 0,
          },
          {
            question: 'What is the first action to take when you hear a fire alarm?',
            options: [
              'Finish your current task',
              'Call emergency services',
              'Evacuate immediately',
              'Investigate the source',
            ],
            correctAnswer: 'Evacuate immediately',
            order: 1,
          },
          {
            question: 'What should you do if you identify a safety hazard?',
            options: [
              'Wait for someone else to report it',
              'Report it immediately to your supervisor',
              'Try to fix it yourself',
              'Document it but take no action',
            ],
            correctAnswer: 'Report it immediately to your supervisor',
            order: 2,
          },
        ],
      },
    },
  })
  console.log('✅ Created test:', test1.title)

  const sop2 = await prisma.sop.create({
    data: {
      title: 'Data Security and Privacy',
      description: 'Guidelines for handling sensitive information',
      content: `# Data Security and Privacy

## Purpose
This SOP establishes guidelines for protecting sensitive company and customer data.

## Password Management
1. Use strong passwords (minimum 12 characters)
2. Never share passwords with colleagues
3. Change passwords every 90 days
4. Use unique passwords for different systems
5. Enable two-factor authentication where available

## Data Handling
1. Only access data necessary for your job function
2. Never send sensitive data via unencrypted email
3. Lock your computer when leaving your desk
4. Shred physical documents containing sensitive information
5. Use company-approved cloud storage only

## Email Security
1. Be cautious of phishing attempts
2. Verify sender identity before opening attachments
3. Report suspicious emails to IT immediately
4. Never click on links in unsolicited emails

## Mobile Device Security
1. Use device passwords or biometric locks
2. Install security updates promptly
3. Report lost or stolen devices immediately
4. Never store sensitive data on personal devices

## Incident Reporting
Report any suspected security breaches to IT immediately, including:
- Lost or stolen devices
- Suspected malware infections
- Unusual account activity
- Data exposure incidents`,
      category: 'IT Security',
      version: '1.0',
    },
  })
  console.log('✅ Created SOP:', sop2.title)

  // Create test for SOP 2
  const test2 = await prisma.competencyTest.create({
    data: {
      sopId: sop2.id,
      title: 'Data Security Competency Test',
      passingScore: 80,
      questions: {
        create: [
          {
            question: 'What is the minimum length for a strong password?',
            options: ['6 characters', '8 characters', '10 characters', '12 characters'],
            correctAnswer: '12 characters',
            order: 0,
          },
          {
            question: 'What should you do when leaving your desk?',
            options: [
              'Leave computer unlocked',
              'Lock your computer',
              'Log out completely',
              'Put computer to sleep',
            ],
            correctAnswer: 'Lock your computer',
            order: 1,
          },
          {
            question: 'How should you handle suspicious emails?',
            options: [
              'Delete them',
              'Forward to colleagues',
              'Report to IT immediately',
              'Open to investigate',
            ],
            correctAnswer: 'Report to IT immediately',
            order: 2,
          },
        ],
      },
    },
  })
  console.log('✅ Created test:', test2.title)

  const sop3 = await prisma.sop.create({
    data: {
      title: 'Customer Service Excellence',
      description: 'Standards for delivering exceptional customer service',
      content: `# Customer Service Excellence

## Core Principles
Our customer service approach is built on respect, empathy, and professionalism.

## Communication Standards
1. Answer phone calls within 3 rings
2. Greet customers warmly and professionally
3. Use the customer's name when known
4. Listen actively without interrupting
5. Speak clearly and at an appropriate pace

## Problem Resolution
1. Acknowledge the customer's concern
2. Ask clarifying questions to understand the issue
3. Provide clear explanations of solutions
4. Set realistic expectations for resolution times
5. Follow up to ensure satisfaction

## Handling Difficult Situations
1. Remain calm and professional
2. Never take complaints personally
3. Show empathy and understanding
4. Escalate to supervisor when necessary
5. Document all interactions thoroughly

## Service Recovery
When mistakes occur:
1. Apologize sincerely
2. Take ownership of the issue
3. Provide a fair solution promptly
4. Learn from the experience
5. Follow up to ensure resolution

## Professional Standards
1. Maintain a positive attitude
2. Be punctual and reliable
3. Dress appropriately
4. Respect confidentiality
5. Continuously improve your skills`,
      category: 'Customer Service',
      version: '1.0',
    },
  })
  console.log('✅ Created SOP:', sop3.title)

  // Assign SOPs to users
  await prisma.sopAssignment.create({
    data: {
      userId: user.id,
      sopId: sop1.id,
      status: 'PENDING',
    },
  })

  await prisma.sopAssignment.create({
    data: {
      userId: user.id,
      sopId: sop2.id,
      status: 'PENDING',
    },
  })

  await prisma.sopAssignment.create({
    data: {
      userId: user2.id,
      sopId: sop1.id,
      status: 'COMPLETED',
    },
  })

  console.log('✅ Created assignments')

  // Get the questions for test1 to create proper test result
  const test1Questions = await prisma.testQuestion.findMany({
    where: { testId: test1.id },
    orderBy: { order: 'asc' }
  })

  // Create a test result for user2 (Jane Smith)
  await prisma.testResult.create({
    data: {
      userId: user2.id,
      testId: test1.id,
      score: 100,
      passed: true,
      answers: {
        [test1Questions[0].id]: 'Report it immediately',      // Correct
        [test1Questions[1].id]: 'Evacuate immediately',       // Correct
        [test1Questions[2].id]: 'Report it immediately to your supervisor', // Correct
      },
    },
  })

  console.log('✅ Created test results')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




