import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const { accountStatus } = req.query;
    const where = { role: 'student' };
    if (accountStatus) where.accountStatus = accountStatus;

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        program: true,
        studentId: true,
        bio: true,
        accountStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, program, password, creator } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        studentId: studentId || '',
        program: program || (studentId && studentId.includes('ECE') ? 'BSECE' : studentId && studentId.includes('CPE') ? 'BSCpE' : 'BSIT'),
        role: 'student',
        password: hashedPassword,
        accountStatus: 'active', // Automatically approved when added directly by admin or faculty
      },
    });

    await prisma.activity.create({
      data: {
        type: 'registration',
        detail: `Student account "${created.name}" was added directly and approved by ${creator || 'Staff'}.`,
        user: creator || 'Staff',
      },
    });

    res.status(201).json({
      id: created.id,
      name: created.name,
      email: created.email,
      program: created.program,
      studentId: created.studentId,
      accountStatus: created.accountStatus,
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student account' });
  }
});

// PATCH /api/students/:id/status  — approve or reject a pending student
router.patch('/:id/status', async (req, res) => {
  try {
    const { accountStatus, reviewer } = req.body;
    if (!['active', 'rejected', 'pending'].includes(accountStatus)) {
      return res.status(400).json({ error: 'Invalid accountStatus value.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { accountStatus },
    });

    await prisma.activity.create({
      data: {
        type: 'account_review',
        detail: `Student account "${updated.name}" was ${accountStatus === 'active' ? 'approved' : accountStatus}.`,
        user: reviewer || 'Faculty',
      },
    });

    res.json({ ok: true, id: updated.id, accountStatus: updated.accountStatus });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ error: 'Failed to update student account status' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Failed to delete student account' });
  }
});

export default router;
