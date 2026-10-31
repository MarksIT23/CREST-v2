import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const cats = await prisma.category.findMany({ select: { name: true, program: true } });
console.log(JSON.stringify(cats, null, 1));
console.log('total papers:', await prisma.researchPaper.count());
console.log('approved papers:', await prisma.researchPaper.count({ where: { status: 'approved' } }));
await prisma.$disconnect();
