import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unaxchblqookqxmlxmyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYXhjaGJscW9va3F4bWx4bXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU2NzcsImV4cCI6MjEwNTczMTY3N30.1Oc1U9-Mslxd22KlVLEnbWmwuDuczYV1MPo6u5Z90Lo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('--- Verifying Supabase Integration ---');

  // 1. Categories
  const { data: cats, error: catsErr } = await supabase.from('categories').select('*');
  if (catsErr) throw new Error(`Categories error: ${catsErr.message}`);
  console.log(`✔ Categories: ${cats.length} loaded.`);

  // 2. Faculty
  const { data: faculty, error: facErr } = await supabase.from('faculty').select('*');
  if (facErr) throw new Error(`Faculty error: ${facErr.message}`);
  console.log(`✔ Faculty: ${faculty.length} loaded.`);

  // 3. Research Records
  const { data: papers, error: papersErr } = await supabase.from('research_records').select('*');
  if (papersErr) throw new Error(`Papers error: ${papersErr.message}`);
  console.log(`✔ Research Papers: ${papers.length} loaded.`);

  // 4. Test Full-Text Search
  const { data: searchResults, error: searchErr } = await supabase
    .from('research_records')
    .select('title')
    .textSearch('fts', 'blockchain');
  if (searchErr) console.warn('FTS notice:', searchErr.message);
  else console.log(`✔ Full-Text Search for "blockchain": ${searchResults.length} match(es).`);

  // 5. Test Storage Bucket & File Access
  const { data: storageFiles, error: storageErr } = await supabase.storage.from('capstones').list();
  if (storageErr) throw new Error(`Storage error: ${storageErr.message}`);
  console.log(`✔ Storage Capstones Bucket: ${storageFiles.length} file(s) found:`, storageFiles.map(f => f.name));

  // 6. Test Authentication
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@wesleyan.edu.ph',
    password: 'password123',
  });
  if (authErr) throw new Error(`Auth error: ${authErr.message}`);
  console.log(`✔ Auth Sign-in successful for: ${authData.user.email} (Role: ${authData.user.user_metadata?.role})`);

  console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
