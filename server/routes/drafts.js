import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/drafts
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json([]);

    const drafts = await prisma.draft.findMany({
      where: { submittedBy: email },
      orderBy: { savedAt: 'desc' },
    });

    const parsed = drafts.map((d) => ({
      ...d,
      authors: d.authors ? JSON.parse(d.authors) : [''],
      savedAt: d.savedAt.toISOString(),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// POST /api/drafts
router.post('/', async (req, res) => {
  try {
    const draft = req.body;
    if (!draft.submittedBy) {
      return res.status(400).json({ error: 'submittedBy email is required' });
    }

    if (draft.id) {
      await prisma.draft.deleteMany({
        where: { id: draft.id },
      });
    }

    const created = await prisma.draft.create({
      data: {
        id: draft.id || undefined,
        title: draft.title || '',
        thesisNumber: draft.thesisNumber || '',
        program: draft.program || 'BSIT',
        category: draft.category || '',
        abstract: draft.abstract || '',
        authors: JSON.stringify(Array.isArray(draft.authors) ? draft.authors : [draft.authors || '']),
        keywords: draft.keywords || '',
        advisor: draft.advisor || '',
        sourceUrl: draft.sourceUrl || '',
        year: draft.year ? Number(draft.year) : new Date().getFullYear(),
        submittedBy: draft.submittedBy,
      },
    });

    res.json({
      ...created,
      authors: JSON.parse(created.authors),
      savedAt: created.savedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// DELETE /api/drafts/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.draft.delete({
      where: { id: req.params.id },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

export default router;
