import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { program } = req.query;
    let where = {};
    if (program && program !== 'all' && program !== 'All CECT') {
      where = {
        OR: [{ program: program }, { program: 'Both' }],
      };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const papers = await prisma.researchPaper.findMany({
      where: { status: 'approved' },
      select: { category: true },
    });

    const result = categories.map((c) => ({
      ...c,
      count: papers.filter((p) => p.category === c.name).length,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, color, description, program } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await prisma.category.create({
      data: {
        name,
        slug,
        program: program || 'Both',
        color: color || '#004ac6',
        description: description || '',
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const cat = await prisma.category.findUnique({
      where: { id: req.params.id },
    });
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const inUse = await prisma.researchPaper.findFirst({
      where: { category: cat.name },
    });
    if (inUse) {
      return res.status(400).json({ error: 'Cannot delete category that is currently linked to research papers.' });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
