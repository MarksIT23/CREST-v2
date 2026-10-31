// ---------------------------------------------------------------------------
// CREST CECT Data Layer
// Connected directly to Supabase Cloud (PostgreSQL, Auth & Storage)
// ---------------------------------------------------------------------------

import { supabase } from './supabase';

function formatPaper(p) {
  if (!p) return null;
  return {
    ...p,
    thesisNumber: p.thesis_number || p.thesisNumber || '',
    sourceUrl: p.source_url || p.sourceUrl || '',
    pdfUrl: p.pdf_url || p.pdfUrl || '',
    submittedBy: p.submitted_by || p.submittedBy || '',
    submittedAt: p.submitted_at || p.submittedAt || p.created_at,
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
    reviewNote: p.review_note || p.reviewNote || null,
    authors: Array.isArray(p.authors) ? p.authors : (typeof p.authors === 'string' ? JSON.parse(p.authors || '[]') : []),
    keywords: Array.isArray(p.keywords) ? p.keywords : (typeof p.keywords === 'string' ? JSON.parse(p.keywords || '[]') : []),
  };
}

// ---------------------------------------------------------------------------
// Research Papers
// ---------------------------------------------------------------------------

export async function getPapers(filters = {}) {
  try {
    let query = supabase.from('research_records').select('*');

    if (filters.program && filters.program !== 'all' && filters.program !== 'All CECT') {
      query = query.eq('program', filters.program);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.year) {
      query = query.eq('year', parseInt(filters.year, 10));
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.author) {
      query = query.ilike('submitted_by', `%${filters.author}%`);
    }
    if (filters.search) {
      const s = filters.search.trim();
      query = query.or(`title.ilike.%${s}%,abstract.ilike.%${s}%,thesis_number.ilike.%${s}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching papers from Supabase:', error);
      return [];
    }
    return (data || []).map(formatPaper);
  } catch (err) {
    console.error('getPapers error:', err);
    return [];
  }
}

export async function getPaperById(id) {
  try {
    const { data, error } = await supabase
      .from('research_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    // Increment view count via RPC
    try {
      await supabase.rpc('increment_paper_views', { paper_id: id });
    } catch {
      // non-fatal
    }

    return formatPaper(data);
  } catch (err) {
    console.error('getPaperById error:', err);
    return null;
  }
}

export async function getRelatedPapers(paper, limit = 3) {
  if (!paper) return [];
  try {
    const { data, error } = await supabase
      .from('research_records')
      .select('*')
      .eq('category', paper.category)
      .eq('status', 'approved')
      .neq('id', paper.id)
      .limit(limit);

    if (error) return [];
    return (data || []).map(formatPaper);
  } catch {
    return [];
  }
}

export async function submitPaper(data) {
  const payload = {
    title: data.title,
    thesis_number: data.thesisNumber || data.thesis_number,
    program: data.program || 'BSIT',
    category: data.category,
    abstract: data.abstract,
    authors: Array.isArray(data.authors) ? data.authors : [data.authors].filter(Boolean),
    keywords: Array.isArray(data.keywords) ? data.keywords : [data.keywords].filter(Boolean),
    year: parseInt(data.year, 10) || new Date().getFullYear(),
    advisor: data.advisor,
    source_url: data.sourceUrl || data.source_url,
    pdf_url: data.pdfUrl || data.pdf_url,
    status: data.status || 'pending',
    submitted_by: data.submittedBy || data.submitted_by,
  };

  const { data: inserted, error } = await supabase
    .from('research_records')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  try {
    await supabase.from('activities').insert({
      type: 'submission',
      detail: `submitted research proposal "${data.title}"`,
      user_name: data.submittedBy || 'Student',
    });
  } catch {
    // non-fatal
  }

  return formatPaper(inserted);
}

export async function updatePaper(id, patch) {
  const updatePayload = {};
  if (patch.title) updatePayload.title = patch.title;
  if (patch.abstract) updatePayload.abstract = patch.abstract;
  if (patch.category) updatePayload.category = patch.category;
  if (patch.program) updatePayload.program = patch.program;
  if (patch.year) updatePayload.year = parseInt(patch.year, 10);
  if (patch.advisor) updatePayload.advisor = patch.advisor;
  if (patch.sourceUrl !== undefined) updatePayload.source_url = patch.sourceUrl;
  if (patch.pdfUrl !== undefined) updatePayload.pdf_url = patch.pdfUrl;
  if (patch.authors) updatePayload.authors = Array.isArray(patch.authors) ? patch.authors : [patch.authors];
  if (patch.keywords) updatePayload.keywords = Array.isArray(patch.keywords) ? patch.keywords : [patch.keywords];
  if (patch.status) updatePayload.status = patch.status;

  const { data, error } = await supabase
    .from('research_records')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return formatPaper(data);
}

export async function updatePaperStatus(id, status, reviewer = 'Admin', note = null) {
  const updatePayload = { status, updated_at: new Date().toISOString() };
  // Store pending remark on the paper record (visible to student dashboard)
  if (status === 'pending' && note) {
    updatePayload.review_note = note;
  } else if (status === 'approved') {
    updatePayload.review_note = null; // Clear remark when approved
  }

  const { data, error } = await supabase
    .from('research_records')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('activities').insert({
      type: status === 'approved' ? 'approval' : status === 'pending' ? 'pending' : 'rejection',
      detail: `${status === 'approved' ? 'approved' : status === 'pending' ? 'marked as pending' : 'declined'} research manuscript "${data.title}"`,
      user_name: reviewer,
    });
  } catch {
    // non-fatal
  }

  return formatPaper(data);
}

export async function archivePaper(id, reviewer = 'Administrator') {
  const { data, error } = await supabase
    .from('research_records')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return false;

  try {
    await supabase.from('activities').insert({
      type: 'archive',
      detail: `archived research paper "${data.title}"`,
      user_name: reviewer,
    });
  } catch {
    // non-fatal
  }

  return true;
}

// ---------------------------------------------------------------------------
// File Uploads (Supabase Storage)
// ---------------------------------------------------------------------------

export async function uploadPdf(file) {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage
    .from('capstones')
    .upload(filename, file, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('capstones')
    .getPublicUrl(filename);

  return {
    ok: true,
    url: urlData.publicUrl,
    filename,
    originalName: file.name,
    sizeBytes: file.size,
  };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(filters = {}) {
  try {
    let query = supabase.from('categories').select('*').order('name');
    if (filters.program && filters.program !== 'all' && filters.program !== 'All CECT') {
      query = query.or(`program.eq.${filters.program},program.eq.Both`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

export async function addCategory(category) {
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      slug,
      program: category.program || 'Both',
      color: category.color || '#004ac6',
      description: category.description || '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Faculty
// ---------------------------------------------------------------------------

export async function getFaculty() {
  try {
    const { data, error } = await supabase.from('faculty').select('*').order('name');
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getFacultyById(id) {
  try {
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !faculty) return null;

    // Fetch papers advised by this faculty member
    const rawName = faculty.name.replace(/^(Dr\.|Engr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
    const { data: papers } = await supabase
      .from('research_records')
      .select('*')
      .or(`advisor.ilike.%${faculty.name}%,advisor.ilike.%${rawName}%`)
      .order('year', { ascending: false });

    const formattedPapers = (papers || []).map(formatPaper);

    return {
      ...faculty,
      papers: formattedPapers,
      paperCount: formattedPapers.length,
      advisedPaperList: formattedPapers,
    };
  } catch (err) {
    console.error('getFacultyById error:', err);
    return null;
  }
}

export async function addFaculty(faculty) {
  const { data, error } = await supabase
    .from('faculty')
    .insert({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      specialization: faculty.specialization,
      bio: faculty.bio,
      initials: faculty.initials,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFaculty(id, patch) {
  const { data, error } = await supabase
    .from('faculty')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFaculty(id) {
  try {
    const { error } = await supabase.from('faculty').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Students & Accounts
// ---------------------------------------------------------------------------

export async function getStudents(filters = {}) {
  try {
    let query = supabase.from('profiles').select('*').eq('role', 'student');
    if (filters.accountStatus) {
      query = query.eq('account_status', filters.accountStatus);
    }
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      program: p.program,
      studentId: p.student_id,
      accountStatus: p.account_status,
      bio: p.bio,
      createdAt: p.created_at,
    }));
  } catch {
    return [];
  }
}

export async function updateStudentAccountStatus(id, accountStatus, reviewer = 'Admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ account_status: accountStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('activities').insert({
      type: accountStatus === 'active' ? 'approval' : 'rejection',
      detail: `${accountStatus === 'active' ? 'approved' : 'declined'} student registration (${data.email})`,
      user_name: reviewer,
    });
  } catch {
    // non-fatal
  }

  return { ok: true, profile: data };
}

export async function addStudent(student) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      name: student.name,
      email: student.email,
      role: 'student',
      program: student.program,
      student_id: student.studentId,
      account_status: student.accountStatus || 'active',
      bio: student.bio,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudent(id) {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function getFacultyAccounts(filters = {}) {
  try {
    let query = supabase.from('profiles').select('*').eq('role', 'faculty');
    if (filters.accountStatus) {
      query = query.eq('account_status', filters.accountStatus);
    }
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      program: p.program,
      accountStatus: p.account_status,
      bio: p.bio,
      createdAt: p.created_at,
    }));
  } catch {
    return [];
  }
}

export async function updateFacultyAccountStatus(id, accountStatus, reviewer = 'Admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ account_status: accountStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('activities').insert({
      type: accountStatus === 'active' ? 'approval' : 'rejection',
      detail: `${accountStatus === 'active' ? 'approved' : 'declined'} faculty registration (${data.email})`,
      user_name: reviewer,
    });
  } catch {
    // non-fatal
  }

  return { ok: true, profile: data };
}

// ---------------------------------------------------------------------------
// Analytics & Activity Feed
// ---------------------------------------------------------------------------

export async function getAnalytics() {
  try {
    const [
      { count: totalPapers },
      { count: facultyCount },
      { count: studentCount },
      { data: allPapers },
      { data: allCategories },
    ] = await Promise.all([
      supabase.from('research_records').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('research_records').select('id, title, year, category, program, status, views, citations'),
      supabase.from('categories').select('name, color, program'),
    ]);

    const papers = allPapers || [];
    const categories = allCategories || [];

    // Aggregate totals
    const totalViews = papers.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalCitations = papers.reduce((acc, p) => acc + (p.citations || 0), 0);
    const approvedCount = papers.filter((p) => p.status === 'approved').length;
    const pendingCount = papers.filter((p) => p.status === 'pending').length;

    // By Year
    const yearMap = {};
    for (const p of papers) {
      if (!p.year) continue;
      yearMap[p.year] = (yearMap[p.year] || 0) + 1;
    }
    const byYear = Object.entries(yearMap)
      .map(([year, count]) => ({ year: parseInt(year, 10), count }))
      .sort((a, b) => a.year - b.year);

    // By Category (with color from categories table)
    const catMap = {};
    for (const p of papers) {
      if (!p.category) continue;
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    }
    const catColorMap = Object.fromEntries(categories.map((c) => [c.name, { color: c.color || '#004ac6', program: c.program }]));
    const byCategory = Object.entries(catMap)
      .map(([name, count]) => ({
        name,
        count,
        color: catColorMap[name]?.color || '#004ac6',
        program: catColorMap[name]?.program || 'Both',
      }))
      .sort((a, b) => b.count - a.count);

    // By Program
    const byProgram = {};
    for (const p of papers) {
      const prog = p.program || 'BSIT';
      if (!byProgram[prog]) byProgram[prog] = { count: 0, views: 0, approved: 0 };
      byProgram[prog].count += 1;
      byProgram[prog].views += p.views || 0;
      if (p.status === 'approved') byProgram[prog].approved += 1;
    }

    // Top papers by views
    const topPapers = [...papers]
      .filter((p) => p.status === 'approved')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map((p) => ({ id: p.id, title: p.title, views: p.views || 0 }));

    return {
      totalPapers: totalPapers || 0,
      approvedCount,
      approvedPapers: approvedCount,
      pendingCount,
      pendingPapers: pendingCount,
      facultyCount: facultyCount || 0,
      studentCount: studentCount || 0,
      totalViews,
      totalCitations,
      byYear,
      byCategory,
      byProgram,
      topPapers,
    };
  } catch (err) {
    console.error('getAnalytics error:', err);
    return {
      totalPapers: 0,
      approvedCount: 0,
      approvedPapers: 0,
      pendingCount: 0,
      pendingPapers: 0,
      facultyCount: 0,
      studentCount: 0,
      totalViews: 0,
      totalCitations: 0,
      byYear: [],
      byCategory: [],
      byProgram: {},
      topPapers: [],
    };
  }
}

export async function getActivities(limit = 12) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map((a) => ({
      id: a.id,
      type: a.type,
      detail: a.detail,
      user: a.user_name,
      timestamp: a.timestamp,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------

export async function saveDraft(draft) {
  const payload = {
    title: draft.title,
    thesis_number: draft.thesisNumber,
    program: draft.program,
    category: draft.category,
    abstract: draft.abstract,
    authors: Array.isArray(draft.authors) ? draft.authors : [draft.authors].filter(Boolean),
    keywords: Array.isArray(draft.keywords) ? draft.keywords : [draft.keywords].filter(Boolean),
    advisor: draft.advisor,
    source_url: draft.sourceUrl,
    year: draft.year ? parseInt(draft.year, 10) : null,
    submitted_by: draft.submittedBy,
  };

  if (draft.id) {
    const { data, error } = await supabase
      .from('drafts')
      .update(payload)
      .eq('id', draft.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('drafts')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function getDrafts(email) {
  if (!email) return [];
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('submitted_by', email)
      .order('saved_at', { ascending: false });

    if (error) return [];
    return (data || []).map((d) => ({
      ...d,
      thesisNumber: d.thesis_number,
      sourceUrl: d.source_url,
      submittedBy: d.submitted_by,
      savedAt: d.saved_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteDraft(id) {
  try {
    const { error } = await supabase.from('drafts').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
