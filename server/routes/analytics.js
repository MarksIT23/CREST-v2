import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics
router.get('/', async (_req, res) => {
  try {
    const papers = await prisma.researchPaper.findMany();
    const categories = await prisma.category.findMany();

    const totalPapers = papers.length;
    const totalViews = papers.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalCitations = papers.reduce((acc, p) => acc + (p.citations || 0), 0);

    const pendingCount = papers.filter((p) => p.status === 'pending').length;
    const approvedCount = papers.filter((p) => p.status === 'approved').length;
    const archivedCount = papers.filter((p) => p.status === 'archived').length;
    const rejectedCount = papers.filter((p) => p.status === 'rejected').length;

    // By Program
    const bsitPapers = papers.filter((p) => p.program === 'BSIT');
    const bscpePapers = papers.filter((p) => p.program === 'BSCpE');
    const bsecePapers = papers.filter((p) => p.program === 'BSECE');

    const byProgram = {
      BSIT: {
        count: bsitPapers.length,
        views: bsitPapers.reduce((acc, p) => acc + (p.views || 0), 0),
        pending: bsitPapers.filter((p) => p.status === 'pending').length,
        approved: bsitPapers.filter((p) => p.status === 'approved').length,
      },
      BSCpE: {
        count: bscpePapers.length,
        views: bscpePapers.reduce((acc, p) => acc + (p.views || 0), 0),
        pending: bscpePapers.filter((p) => p.status === 'pending').length,
        approved: bscpePapers.filter((p) => p.status === 'approved').length,
      },
      BSECE: {
        count: bsecePapers.length,
        views: bsecePapers.reduce((acc, p) => acc + (p.views || 0), 0),
        pending: bsecePapers.filter((p) => p.status === 'pending').length,
        approved: bsecePapers.filter((p) => p.status === 'approved').length,
      },
    };

    // By Year
    const yearMap = {};
    papers.forEach((p) => {
      yearMap[p.year] = (yearMap[p.year] || 0) + 1;
    });
    const byYear = Object.keys(yearMap)
      .sort()
      .map((y) => ({ year: Number(y), count: yearMap[y] }));

    // By Category
    const byCategory = categories.map((c) => ({
      name: c.name,
      color: c.color,
      program: c.program,
      count: papers.filter((p) => p.category === c.name).length,
    }));

    // Top papers
    const topPapers = [...papers]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        program: p.program,
        category: p.category,
        views: p.views,
        citations: p.citations,
        year: p.year,
      }));

    res.json({
      totalPapers,
      totalViews,
      totalCitations,
      pendingCount,
      approvedCount,
      archivedCount,
      rejectedCount,
      byProgram,
      byYear,
      byCategory,
      topPapers,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

// GET /api/analytics/activities
router.get('/activities', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
