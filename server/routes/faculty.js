import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isStaffRequester } from '../middleware/optionalAuth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/faculty
router.get('/', async (_req, res) => {
  try {
    const faculty = await prisma.faculty.findMany({
      orderBy: { name: 'asc' },
    });

    const papers = await prisma.researchPaper.findMany({
      select: { id: true, advisor: true },
    });

    // Map papers advised by faculty
    const list = faculty.map((f) => {
      const advisedPapers = papers.filter((p) => p.advisor && (p.advisor.includes(f.name) || f.name.includes(p.advisor))).map((p) => p.id);
      return {
        ...f,
        papers: advisedPapers,
        paperCount: advisedPapers.length,
      };
    });

    res.json(list);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// GET /api/faculty/accounts — faculty user accounts (admin approval queue)
router.get('/accounts', async (req, res) => {
  try {
    const { accountStatus } = req.query;
    const where = { role: 'faculty' };
    if (accountStatus) where.accountStatus = accountStatus;

    const accounts = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        program: true,
        accountStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching faculty accounts:', error);
    res.status(500).json({ error: 'Failed to fetch faculty accounts' });
  }
});

// PATCH /api/faculty/accounts/:id/status — approve or reject a pending faculty account (admin only)
router.patch('/accounts/:id/status', async (req, res) => {
  try {
    const { accountStatus, reviewer } = req.body;
    if (!['active', 'rejected', 'pending'].includes(accountStatus)) {
      return res.status(400).json({ error: 'Invalid accountStatus value.' });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target || target.role !== 'faculty') {
      return res.status(404).json({ error: 'Faculty account not found.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { accountStatus },
    });

    await prisma.activity.create({
      data: {
        type: 'account_review',
        detail: `Faculty account "${updated.name}" was ${accountStatus === 'active' ? 'approved' : accountStatus}.`,
        user: reviewer || 'Administrator',
      },
    });

    res.json({ ok: true, id: updated.id, accountStatus: updated.accountStatus });
  } catch (error) {
    console.error('Error updating faculty account status:', error);
    res.status(500).json({ error: 'Failed to update faculty account status' });
  }
});

// GET /api/faculty/:id
router.get('/:id', async (req, res) => {
  try {
    const f = await prisma.faculty.findUnique({
      where: { id: req.params.id },
    });
    if (!f) return res.status(404).json({ error: 'Faculty member not found' });

    const papers = await prisma.researchPaper.findMany({
      where: {
        advisor: { contains: f.name },
      },
    });

    const { staff } = isStaffRequester(req);
    const visiblePapers = staff ? papers : papers.filter((p) => p.status === 'approved');

    res.json({
      ...f,
      papers: visiblePapers.map((p) => p.id),
      paperCount: visiblePapers.length,
      advisedPaperList: visiblePapers,
    });
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    res.status(500).json({ error: 'Failed to fetch faculty member' });
  }
});

// POST /api/faculty
router.post('/', async (req, res) => {
  try {
    const { name, email, department, specialization, bio } = req.body;
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    const created = await prisma.faculty.create({
      data: {
        name,
        email,
        department: department || 'Information Technology',
        specialization: specialization || '',
        bio: bio || '',
        initials,
      },
    });

    // Ensure User account exists for the faculty member
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'faculty',
          program: (department || '').includes('Electronics') ? 'BSECE' : (department || '').includes('Computer') ? 'BSCpE' : 'BSIT',
          accountStatus: 'active',
          bio: bio || '',
        },
      });
    }

    res.status(201).json({ ...created, papers: [], paperCount: 0 });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ error: 'Failed to create faculty member' });
  }
});

// DELETE /api/faculty/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.faculty.delete({
      where: { id: req.params.id },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty member' });
  }
});

export default router;
