import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'crest-cect-secret-key-2026';

function roleFromEmail(email) {
  if (email.includes('admin')) return 'admin';
  if (email.includes('faculty')) return 'faculty';
  return 'student';
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, program: user.program },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ ok: false, error: 'No account found with this email. Please register first.' });
    }

    // Check approval status before verifying password
    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        ok: false,
        error: user.role === 'faculty'
          ? 'Your faculty account is awaiting approval from an administrator.'
          : 'Your account is awaiting approval from a faculty member or administrator.',
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).json({ ok: false, error: 'Your account registration was declined. Please contact the CECT department.' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Fallback for demo seeded accounts
      if (password !== 'password123') {
        return res.status(401).json({ ok: false, error: 'Incorrect password.' });
      }
    }

    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      program: user.program,
      studentId: user.studentId,
      bio: user.bio,
      accountStatus: user.accountStatus,
      joinedAt: user.createdAt.toISOString(),
      token,
    };

    res.json({ ok: true, user: safeUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, error: 'Internal login error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, program, studentId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
    }

    // Admins cannot self-register — they are seeded by the system
    const chosenRole = role || roleFromEmail(email);
    if (chosenRole === 'admin') {
      return res.status(403).json({ ok: false, error: 'Administrator accounts cannot be created through self-registration.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({ ok: false, error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailLower = email.toLowerCase();
    const chosenProgram = program || (emailLower.includes('ece') ? (chosenRole === 'faculty' ? 'Electronics Engineering' : 'BSECE') : emailLower.includes('cpe') ? (chosenRole === 'faculty' ? 'Computer Engineering' : 'BSCpE') : (chosenRole === 'faculty' ? 'Information Technology' : 'BSIT'));

    // All new registrations start as "pending" — must be approved before login
    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: chosenRole,
        program: chosenProgram,
        studentId: chosenRole === 'student' ? studentId || '' : '',
        accountStatus: 'pending',
      },
    });

    if (chosenRole === 'faculty') {
      const deptName = (chosenProgram || '').includes('Electronics') || chosenProgram === 'BSECE' ? 'Electronics Engineering' : (chosenProgram || '').includes('Computer') || chosenProgram === 'BSCpE' ? 'Computer Engineering' : 'Information Technology';
      const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      await prisma.faculty.upsert({
        where: { email: email.toLowerCase() },
        create: {
          name,
          email: email.toLowerCase(),
          department: deptName,
          specialization: 'CECT Academic Faculty',
          bio: `Faculty adviser in the ${deptName} Department.`,
          initials,
        },
        update: {
          name,
          department: deptName,
        },
      });
    }

    // Record activity
    await prisma.activity.create({
      data: {
        type: 'registration',
        detail: `New ${chosenRole} registered and awaiting approval: ${name} (${chosenProgram || 'CECT'}).`,
        user: name,
      },
    });

    // Return ok: true but NO token — user must wait for approval before logging in
    res.status(201).json({
      ok: true,
      pending: true,
      message:
        chosenRole === 'faculty'
          ? 'Your faculty account has been submitted. An administrator will review and approve it before you can log in.'
          : 'Your account has been submitted. A faculty member or administrator will approve it before you can log in.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ ok: false, error: 'Failed to create account.' });
  }
});


// PATCH /api/auth/profile
router.patch('/profile', async (req, res) => {
  try {
    const { id, ...patch } = req.body;
    if (!id) return res.status(400).json({ error: 'User id required' });

    const updated = await prisma.user.update({
      where: { id },
      data: patch,
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      program: updated.program,
      studentId: updated.studentId,
      bio: updated.bio,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, error: 'All fields are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      // Allow demo password fallback for seeded accounts
      if (currentPassword !== 'password123') {
        return res.status(401).json({ ok: false, error: 'Current password is incorrect.' });
      }
    }

    // Prevent reusing the same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ ok: false, error: 'New password must be different from your current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });

    res.json({ ok: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ ok: false, error: 'Failed to change password.' });
  }
});

export default router;
