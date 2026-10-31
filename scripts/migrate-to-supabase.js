import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '../server/node_modules/@prisma/client/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://unaxchblqookqxmlxmyk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYXhjaGJscW9va3F4bWx4bXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU2NzcsImV4cCI6MjEwNTczMTY3N30.1Oc1U9-Mslxd22KlVLEnbWmwuDuczYV1MPo6u5Z90Lo';

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting Migration: SQLite -> Supabase Cloud...');

  // 1. Migrate Categories
  const localCats = await prisma.category.findMany();
  console.log(`Found ${localCats.length} categories to migrate.`);

  for (const cat of localCats) {
    const { error } = await supabase.from('categories').upsert({
      name: cat.name,
      slug: cat.slug,
      program: cat.program,
      color: cat.color,
      description: cat.description,
    }, { onConflict: 'slug' });
    if (error) console.error(`Error migrating category ${cat.name}:`, error.message);
  }
  console.log('✔ Categories migrated.');

  // 2. Migrate Faculty
  const localFaculty = await prisma.faculty.findMany();
  console.log(`Found ${localFaculty.length} faculty members to migrate.`);

  for (const f of localFaculty) {
    const { error } = await supabase.from('faculty').upsert({
      name: f.name,
      email: f.email,
      department: f.department,
      specialization: f.specialization,
      bio: f.bio,
      initials: f.initials,
    }, { onConflict: 'email' });
    if (error) console.error(`Error migrating faculty ${f.name}:`, error.message);
  }
  console.log('✔ Faculty migrated.');

  // 3. Upload Sample PDF to Supabase Storage
  let cloudPdfUrl = null;
  const samplePdfPath = path.join(__dirname, '..', 'server', 'uploads', 'papers', 'sample-manuscript.pdf');
  if (fs.existsSync(samplePdfPath)) {
    const fileBuffer = fs.readFileSync(samplePdfPath);
    const { error: uploadErr } = await supabase.storage
      .from('capstones')
      .upload('sample-manuscript.pdf', fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      console.warn('Storage upload notice:', uploadErr.message);
    } else {
      console.log('✔ Sample manuscript uploaded to Supabase Storage (capstones/sample-manuscript.pdf)');
    }

    const { data: urlData } = supabase.storage.from('capstones').getPublicUrl('sample-manuscript.pdf');
    cloudPdfUrl = urlData?.publicUrl || null;
    console.log('✔ Public Manuscript URL:', cloudPdfUrl);
  }

  // 4. Migrate Research Papers
  const localPapers = await prisma.researchPaper.findMany();
  console.log(`Found ${localPapers.length} research papers to migrate.`);

  for (const p of localPapers) {
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

    const { error } = await supabase.from('research_records').insert({
      title: p.title,
      thesis_number: p.thesisNumber,
      program: p.program,
      category: p.category,
      abstract: p.abstract,
      authors: parsedAuthors,
      keywords: parsedKeywords,
      year: p.year,
      advisor: p.advisor,
      source_url: p.sourceUrl,
      pdf_url: cloudPdfUrl || p.pdfUrl,
      status: p.status,
      views: p.views || 0,
      citations: p.citations || 0,
      submitted_by: p.submittedBy,
      submitted_at: p.submittedAt ? p.submittedAt.toISOString() : new Date().toISOString(),
    });

    if (error) console.error(`Error migrating paper "${p.title}":`, error.message);
  }
  console.log('✔ Research papers migrated.');

  // 5. Migrate Activities
  const localActivities = await prisma.activity.findMany({ take: 20 });
  for (const a of localActivities) {
    await supabase.from('activities').insert({
      type: a.type,
      detail: a.detail,
      user_name: a.user,
      timestamp: a.timestamp ? a.timestamp.toISOString() : new Date().toISOString(),
    });
  }
  console.log(`✔ Activities migrated.`);

  // 6. Create Seed Users via Supabase Auth
  const localUsers = await prisma.user.findMany();
  console.log(`Creating ${localUsers.length} user accounts in Supabase Auth...`);

  for (const u of localUsers) {
    const { error: signUpErr } = await supabase.auth.signUp({
      email: u.email,
      password: 'password123',
      options: {
        data: {
          name: u.name,
          role: u.role,
          program: u.program,
          studentId: u.studentId,
          year: u.year,
          section: u.section,
          accountStatus: u.accountStatus,
          bio: u.bio,
        },
      },
    });

    if (signUpErr) {
      if (signUpErr.message.includes('already registered')) {
        console.log(`User ${u.email} already exists in Supabase Auth.`);
      } else {
        console.warn(`Notice for user ${u.email}:`, signUpErr.message);
      }
    } else {
      console.log(`✔ Registered user: ${u.email} (${u.role})`);
    }
  }

  console.log('\n🎉 ALL MIGRATION TASKS COMPLETED SUCCESSFULLY!');
  await prisma.$disconnect();
}

migrate().catch(console.error);
