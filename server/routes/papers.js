import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isStaffRequester } from '../middleware/optionalAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

function formatPaper(p) {
  if (!p) return null;
  let parsedAuthors = [];
  let parsedKeywords = [];

  try {
    parsedAuthors = typeof p.authors === 'string' ? JSON.parse(p.authors) : p.authors;
  } catch {
    parsedAuthors = [p.authors || ''];
  }

  try {
    parsedKeywords = typeof p.keywords === 'string' ? JSON.parse(p.keywords) : p.keywords;
  } catch {
    parsedKeywords = [];
  }

  return {
    ...p,
    authors: parsedAuthors,
    keywords: parsedKeywords,
    submittedAt: p.submittedAt ? p.submittedAt.toISOString() : null,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
  };
}

// GET /api/papers
router.get('/', async (req, res) => {
  try {
    const { search, program, category, status, year, author } = req.query;
    const { requester, staff } = isStaffRequester(req);
    const ownQuery =
      !!author &&
      !!requester?.email &&
      author.toLowerCase() === String(requester.email).toLowerCase();

    const where = {};

    if (program && program !== 'all' && program !== 'All CECT') {
      where.program = program;
    }

    if (category) {
      where.category = category;
    }

    if (staff || ownQuery) {
      if (status) {
        where.status = status;
      }
    } else {
      where.status = 'approved';
    }

    if (year) {
      where.year = Number(year);
    }

    if (author) {
      where.submittedBy = { contains: author.toLowerCase() };
    }

    let papers = await prisma.researchPaper.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    let formatted = papers.map(formatPaper);

    if (search) {
      const q = search.toLowerCase();
      formatted = formatted.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          (p.thesisNumber || '').toLowerCase().includes(q) ||
          (p.authors || []).some((a) => a.toLowerCase().includes(q)) ||
          (p.keywords || []).some((k) => k.toLowerCase().includes(q)) ||
          (p.advisor || '').toLowerCase().includes(q)
      );
    }

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// GET /api/papers/:id
router.get('/:id', async (req, res) => {
  try {
    const paper = await prisma.researchPaper.findUnique({
      where: { id: req.params.id },
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const { requester: viewer, staff: viewerStaff } = isStaffRequester(req);
    const owner =
      !!viewer?.email &&
      !!paper.submittedBy &&
      String(paper.submittedBy).toLowerCase() === String(viewer.email).toLowerCase();
    if (paper.status !== 'approved' && !viewerStaff && !owner) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Increment views
    await prisma.researchPaper.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.json(formatPaper({ ...paper, views: paper.views + 1 }));
  } catch (error) {
    console.error('Error fetching paper by id:', error);
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// POST /api/papers
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const year = Number(data.year) || new Date().getFullYear();
    const program = data.program || 'BSIT';

    let thesisNumber = data.thesisNumber;
    if (!thesisNumber) {
      const progCode = program === 'BSCpE' ? 'CPE' : program === 'BSECE' ? 'ECE' : 'IT';
      const randomId = Math.floor(100 + Math.random() * 900);
      thesisNumber = `WU-CECT-${progCode}-${year}-${randomId}`;
    }

    const created = await prisma.researchPaper.create({
      data: {
        title: data.title,
        thesisNumber,
        program,
        category: data.category,
        abstract: data.abstract,
        authors: JSON.stringify(Array.isArray(data.authors) ? data.authors : [data.authors || '']),
        keywords: JSON.stringify(Array.isArray(data.keywords) ? data.keywords : (data.keywords || '').split(',').map((k) => k.trim()).filter(Boolean)),
        year,
        advisor: data.advisor || 'To be assigned',
        sourceUrl: data.sourceUrl || '',
        pdfUrl: data.pdfUrl || '#',
        status: data.status || 'pending',
        views: 0,
        citations: 0,
        submittedBy: data.submittedBy || 'Anonymous',
      },
    });

    // Record activity
    await prisma.activity.create({
      data: {
        type: 'submission',
        detail: `"${created.title}" was submitted for review (${program}).`,
        user: created.submittedBy,
      },
    });

    res.status(201).json(formatPaper(created));
  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({ error: 'Failed to submit paper' });
  }
});

// PATCH /api/papers/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.thesisNumber !== undefined) updateData.thesisNumber = data.thesisNumber;
    if (data.program !== undefined) updateData.program = data.program;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.abstract !== undefined) updateData.abstract = data.abstract;
    if (data.year !== undefined) updateData.year = Number(data.year);
    if (data.advisor !== undefined) updateData.advisor = data.advisor;
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.authors !== undefined) {
      updateData.authors = JSON.stringify(Array.isArray(data.authors) ? data.authors : [data.authors]);
    }
    if (data.keywords !== undefined) {
      updateData.keywords = JSON.stringify(Array.isArray(data.keywords) ? data.keywords : (data.keywords || '').split(',').map((k) => k.trim()).filter(Boolean));
    }

    const updated = await prisma.researchPaper.update({
      where: { id },
      data: updateData,
    });

    res.json(formatPaper(updated));
  } catch (error) {
    console.error('Error updating paper:', error);
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// PATCH /api/papers/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer, note } = req.body;

    const updateData = { status };
    // Store the remark on the paper so students can see it on their dashboard
    if (status === 'pending' && note) {
      updateData.reviewNote = note;
    } else if (status === 'approved') {
      updateData.reviewNote = null; // Clear note on approval
    }

    const paper = await prisma.researchPaper.update({
      where: { id },
      data: updateData,
    });

    // Record activity
    await prisma.activity.create({
      data: {
        type: status === 'approved' ? 'approval' : 'status_update',
        detail: `"${paper.title}" was ${status}.${note ? ` ${note}` : ''}`,
        user: reviewer || 'Administrator',
      },
    });

    res.json(formatPaper(paper));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update paper status' });
  }
});

// PATCH /api/papers/:id/archive  (replaces permanent DELETE)
router.patch('/:id/archive', async (req, res) => {
  try {
    const { reviewer } = req.body;
    const paper = await prisma.researchPaper.update({
      where: { id: req.params.id },
      data: { status: 'archived' },
    });

    await prisma.activity.create({
      data: {
        type: 'status_update',
        detail: `"${paper.title}" was archived.`,
        user: reviewer || 'Administrator',
      },
    });

    res.json({ ok: true, paper: formatPaper(paper) });
  } catch (error) {
    console.error('Error archiving paper:', error);
    res.status(500).json({ error: 'Failed to archive paper' });
  }
});

export default router;
