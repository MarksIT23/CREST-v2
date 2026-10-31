const UNIVERSITY = 'Wesleyan University Philippines';
const COLLEGE = 'College of Engineering and Computer Technology';

export function authorsToArray(authors) {
  if (Array.isArray(authors)) return authors.filter(Boolean);
  if (typeof authors === 'string') {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Not JSON — treat as a single name below
    }
    return authors.trim() ? [authors.trim()] : [];
  }
  return [];
}

function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given: '', surname: '' };
  if (parts.length === 1) return { given: '', surname: parts[0] };
  return { given: parts.slice(0, -1).join(' '), surname: parts[parts.length - 1] };
}

function initialsOf(given) {
  return given
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w[0].toUpperCase()}.`)
    .join(' ');
}

function apaName(full) {
  const { given, surname } = splitName(full);
  return given ? `${surname}, ${initialsOf(given)}` : surname;
}

function mlaName(full, first) {
  const { given, surname } = splitName(full);
  if (first && given) return `${surname}, ${given}`;
  return String(full).trim();
}

function ieeeName(full) {
  const { given, surname } = splitName(full);
  return given ? `${initialsOf(given)} ${surname}` : surname;
}

function joinWith(names, lastSep) {
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]}${lastSep}${names[1]}`;
  return names.slice(0, -1).join(', ') + `${lastSep}${names[names.length - 1]}`;
}

function bibKey(authors, year) {
  const first = splitName(authors[0] || 'unknown');
  return `${first.surname.toLowerCase().replace(/[^a-z0-9]/g, '')}${year || 'nodate'}`;
}

export function formatAPA(paper) {
  const authors = authorsToArray(paper.authors);
  const names = authors.length > 0 ? authors : ['Anonymous'];
  const byline = joinWith(names.map(apaName), ', & ');
  const year = paper.year || 'n.d.';
  return `${byline} (${year}). ${paper.title} (Unpublished undergraduate thesis). ${COLLEGE}, ${UNIVERSITY}.`;
}

export function formatMLA(paper) {
  const authors = authorsToArray(paper.authors);
  const year = paper.year || 'n.d.';
  let byline;
  if (authors.length === 0) byline = 'Anonymous';
  else if (authors.length <= 2) byline = joinWith(authors.map((a, i) => mlaName(a, i === 0)), ', and ');
  else byline = `${mlaName(authors[0], true)}, et al`;
  return `${byline}. "${paper.title}." ${year}. ${UNIVERSITY}, ${COLLEGE}. Undergraduate thesis.`;
}

export function formatIEEE(paper) {
  const authors = authorsToArray(paper.authors);
  const names = authors.length > 0 ? authors : ['Anonymous'];
  const byline = joinWith(names.map(ieeeName), ', and ');
  const year = paper.year || 'n.d.';
  return `${byline}, "${paper.title}," Undergraduate thesis, ${COLLEGE}, ${UNIVERSITY}, ${year}.`;
}

export function formatBibTeX(paper) {
  const authors = authorsToArray(paper.authors);
  const year = paper.year || '';
  const lines = [
    `@bachelorsthesis{${bibKey(authors, year)},`,
    `  author = {${authors.join(' and ') || 'Anonymous'}},`,
    `  title = {${paper.title || ''}},`,
    `  school = {${COLLEGE}, ${UNIVERSITY}},`,
    `  year = {${year}},`,
  ];
  if (paper.thesisNumber) lines.push(`  note = {Thesis No. ${paper.thesisNumber}},`);
  lines.push('}');
  return lines.join('\n');
}

export const CITATION_STYLES = [
  { id: 'apa', label: 'APA 7th', format: formatAPA },
  { id: 'mla', label: 'MLA 9th', format: formatMLA },
  { id: 'ieee', label: 'IEEE', format: formatIEEE },
  { id: 'bibtex', label: 'BibTeX', format: formatBibTeX },
];
