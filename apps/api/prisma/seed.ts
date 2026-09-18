/* Seed: canonical techs, demo users, realistic projects. Idempotent via upserts. */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TECHS = [
  { slug: 'react', name: 'React', category: 'frontend' },
  { slug: 'nextjs', name: 'Next.js', category: 'frontend' },
  { slug: 'flutter', name: 'Flutter', category: 'mobile' },
  { slug: 'python', name: 'Python', category: 'language' },
  { slug: 'pytorch', name: 'PyTorch', category: 'ml' },
  { slug: 'nodejs', name: 'Node.js', category: 'backend' },
  { slug: 'nestjs', name: 'NestJS', category: 'backend' },
  { slug: 'postgres', name: 'PostgreSQL', category: 'database' },
  { slug: 'typescript', name: 'TypeScript', category: 'language' },
  { slug: 'arduino', name: 'Arduino', category: 'iot' },
  { slug: 'django', name: 'Django', category: 'backend' },
  { slug: 'tailwind', name: 'Tailwind CSS', category: 'frontend' },
];

function slugify(title: string, suffix: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) + `-${suffix}`
  );
}

async function main() {
  for (const t of TECHS) {
    await prisma.tech.upsert({ where: { slug: t.slug }, update: { name: t.name }, create: t });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const aarav = await prisma.user.upsert({
    where: { email: 'aarav@college.edu' },
    update: {},
    create: {
      email: 'aarav@college.edu', emailDomain: 'college.edu',
      username: 'aarav', name: 'Aarav Sharma', passwordHash,
      branch: 'CSE', year: 3, bio: 'Full-stack + IoT. Love hackathons.',
      githubUsername: 'aarav-dev',
    },
  });
  const diya = await prisma.user.upsert({
    where: { email: 'diya@cs.college.edu' },
    update: {},
    create: {
      email: 'diya@cs.college.edu', emailDomain: 'cs.college.edu',
      username: 'diya', name: 'Diya Patel', passwordHash,
      branch: 'CSE', year: 2, bio: 'ML + frontend.',
      githubUsername: 'diya-ml',
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@college.edu', emailDomain: 'college.edu',
      username: 'admin', name: 'Lab Admin', passwordHash: adminHash, role: 'ADMIN',
    },
  });

  const demos = [
    {
      title: 'Hostel Laundry Tracker', tagline: 'Token queue + SMS alerts for hostel washers',
      descriptionMd: '## Problem\nLong queues at hostel laundry.\n\n## Solution\nESP32 + web queue with token system.\n\n## Stack\nNext.js, NestJS, Postgres, Arduino.',
      githubUrl: 'https://github.com/aarav/laundry-tracker', demoUrl: 'https://laundry.demo.local',
      techs: ['nextjs', 'nestjs', 'postgres', 'arduino'], ownerId: aarav.id, members: [diya.id],
    },
    {
      title: 'Attendance via Face', tagline: 'Offline face attendance for labs',
      descriptionMd: '## Overview\nPython + OpenCV pipeline, exports CSV for faculty.',
      githubUrl: 'https://github.com/diya-ml/attend-face', techs: ['python', 'pytorch'],
      ownerId: diya.id, members: [] as string[],
    },
    {
      title: 'Campus Lost & Found', tagline: 'Photo-first lost & found with claim flow',
      descriptionMd: 'Post item with photo, claim with proof. Search by hostel + tag.',
      githubUrl: 'https://github.com/aarav/campus-found', techs: ['react', 'nodejs', 'postgres', 'tailwind'],
      ownerId: aarav.id, members: [] as string[],
    },
    {
      title: 'Mess Menu Predictor', tagline: 'Predict mess load, cut food waste',
      descriptionMd: 'Django + simple regression on past headcounts.',
      githubUrl: 'https://github.com/diya-ml/mess-predict', techs: ['django', 'python', 'postgres'],
      ownerId: diya.id, members: [aarav.id],
    },
    {
      title: 'Notes Marketplace', tagline: 'Branch-wise notes with upvotes',
      descriptionMd: 'Upload PDFs, upvote best notes per subject.',
      githubUrl: 'https://github.com/aarav/notes-market', techs: ['nextjs', 'typescript', 'postgres'],
      ownerId: aarav.id, members: [] as string[],
    },
  ];

  for (const [i, d] of demos.entries()) {
    const slug = slugify(d.title, `demo${i}`);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) continue;
    const project = await prisma.project.create({
      data: {
        title: d.title, slug, tagline: d.tagline, descriptionMd: d.descriptionMd,
        githubUrl: d.githubUrl, demoUrl: (d as any).demoUrl ?? null,
        ownerId: d.ownerId, isPublished: true,
        techs: { create: d.techs.map((slug) => ({ tech: { connect: { slug } } })) },
        members: {
          create: [
            { userId: d.ownerId, role: 'OWNER' },
            ...d.members.map((uid) => ({ userId: uid, role: 'MEMBER' as const })),
          ],
        },
      },
    });
    // one cross-upvote so sorting demo is non-trivial
    const voterId = d.ownerId === aarav.id ? diya.id : aarav.id;
    await prisma.upvote.create({ data: { userId: voterId, projectId: project.id } });
    await prisma.project.update({ where: { id: project.id }, data: { upvoteCount: 1 } });
  }

  console.log('Seed done');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
