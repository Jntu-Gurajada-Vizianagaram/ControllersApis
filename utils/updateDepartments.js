const departments = [
  {
    code: 'JNTUGV',
    label: 'JNTU-GV',
    titlePrefix: 'JNTU-GV',
    name: 'Jawaharlal Nehru Technological University Gurajada Vizianagaram',
    updateTypes: [
      { code: 'circular', label: 'Circulars' },
      { code: 'notice', label: 'Notices' },
      { code: 'tender', label: 'Tenders' },
      { code: 'recruitment', label: 'Recruitment' },
      { code: 'notification', label: 'Notifications' },
      { code: 'conference_event', label: 'Conferences / Events' },
      { code: 'news', label: 'News' },
    ],
  },
  {
    code: 'DAAP',
    label: 'Academics',
    titlePrefix: 'Academics',
    name: 'Academic and Planning',
    updateTypes: [
      { code: 'academic_calendar', label: 'Academic Calendars' },
      { code: 'regulation', label: 'Regulations' },
      { code: 'academic_circular', label: 'Academic Circulars' },
      { code: 'course_structure', label: 'Course Structures' },
      { code: 'syllabus', label: 'Syllabi' },
    ],
  },
  {
    code: 'DRD',
    label: 'Research',
    titlePrefix: 'Research',
    name: 'Research and Development',
    updateTypes: [
      { code: 'research_notification', label: 'Research Notifications' },
      { code: 'jrf_srf_recruitment', label: 'JRF / SRF Recruitment' },
      { code: 'research_project', label: 'Research Projects' },
      { code: 'grant_funding', label: 'Grants / Funding' },
      { code: 'conference_workshop', label: 'Conferences / Workshops' },
      { code: 'research_circular', label: 'Research Circulars' },
    ],
  },
  {
    code: 'DA',
    label: 'Admissions',
    titlePrefix: 'Admissions',
    name: 'Admissions',
    updateTypes: [
      { code: 'admission_notification', label: 'Admission Notifications' },
      { code: 'prospectus', label: 'Prospectus' },
      { code: 'eligibility_regulation', label: 'Eligibility / Regulations' },
      { code: 'important_date', label: 'Important Dates' },
      { code: 'counselling', label: 'Counselling' },
      { code: 'merit_selected_list', label: 'Merit / Selected Lists' },
    ],
  },
  {
    code: 'DAR',
    label: 'Alumni Relations',
    titlePrefix: 'Alumni Relations',
    name: 'Alumni Relations',
    updateTypes: [
      { code: 'alumni_notice', label: 'Alumni Notices' },
      { code: 'registration', label: 'Registrations' },
      { code: 'event_reunion', label: 'Events / Reunions' },
      { code: 'alumni_chapter', label: 'Alumni Chapters' },
      { code: 'alumni_achievement', label: 'Alumni Achievements' },
    ],
  },
  {
    code: 'DIQAC',
    label: 'Internal Quality',
    titlePrefix: 'Internal Quality',
    name: 'Internal Quality Assurance',
    updateTypes: [
      { code: 'naac_nba', label: 'NAAC / NBA' },
      { code: 'aqar_iqac_report', label: 'AQAR / IQAC Reports' },
      { code: 'quality_policy', label: 'Quality Policies' },
      { code: 'feedback', label: 'Feedback' },
      { code: 'ranking_accreditation', label: 'Rankings / Accreditation' },
      { code: 'quality_circular', label: 'Quality Circulars' },
    ],
  },
  {
    code: 'CE',
    label: 'Examinations',
    titlePrefix: 'CE',
    name: 'Examinations / Controller of Examinations',
    updateTypes: [
      { code: 'examination_notification', label: 'Examination Notifications' },
      { code: 'time_table', label: 'Time Tables' },
      { code: 'result', label: 'Results' },
      { code: 'revaluation_challenge_valuation', label: 'Revaluation / Challenge Valuation' },
      { code: 'examination_circular', label: 'Examination Circulars' },
      { code: 'certificate', label: 'Certificates' },
    ],
  },
  {
    code: 'PLACEMENTS',
    label: 'Placements',
    titlePrefix: 'Placements',
    name: 'Training and Placement Cell',
    updateTypes: [
      { code: 'placement_notification', label: 'Placement Notifications' },
      { code: 'campus_recruitment_drive', label: 'Campus Recruitment Drives' },
      { code: 'internship_opportunity', label: 'Internship Opportunities' },
      { code: 'job_opportunity', label: 'Job Opportunities' },
      { code: 'training_program', label: 'Training Programs' },
      { code: 'placement_circular', label: 'Placement Circulars' },
      { code: 'company_visit_ppt', label: 'Company Visits / Pre-Placement Talks' },
      { code: 'placement_result', label: 'Placement Results / Selected Candidates' },
    ],
  },
];

const departmentByCode = new Map(departments.map((department) => [department.code, department]));

const aliases = new Map([
  ['JNTU-GV', 'JNTUGV'],
  ['JNTUGV', 'JNTUGV'],
  ['DAA&P', 'DAAP'],
  ['DAAP', 'DAAP'],
  ['ACADEMICS', 'DAAP'],
  ['ACADEMIC AND PLANNING', 'DAAP'],
  ['ACADEMIC PLANNING', 'DAAP'],
  ['DR&D', 'DRD'],
  ['DRD', 'DRD'],
  ['RESEARCH', 'DRD'],
  ['DA', 'DA'],
  ['ADMISSIONS', 'DA'],
  ['DE', 'CE'],
  ['EXAMS', 'CE'],
  ['EXAMINATIONS', 'CE'],
  ['DAR', 'DAR'],
  ['ALUMNI', 'DAR'],
  ['ALUMNI RELATIONS', 'DAR'],
  ['DIQAC', 'DIQAC'],
  ['IQAC', 'DIQAC'],
  ['QUALITY', 'DIQAC'],
  ['INTERNAL QUALITY', 'DIQAC'],
  ['CE', 'CE'],
  ['PLACEMENT', 'PLACEMENTS'],
  ['PLACEMENTS', 'PLACEMENTS'],
  ['TRAINING AND PLACEMENT', 'PLACEMENTS'],
  ['TNP', 'PLACEMENTS'],
]);

const legacyTypeAliases = new Map([
  ['calendar', 'academic_calendar'],
  ['exams', 'examination_notification'],
  ['examination', 'examination_notification'],
  ['conference', 'conference_event'],
  ['workshop', 'conference_workshop'],
  ['sports', 'news'],
]);

const normalizeDepartmentCode = (value) => {
  const key = String(value || 'JNTUGV')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

  return aliases.get(key) || (departmentByCode.has(key) ? key : 'JNTUGV');
};

const getDepartment = (value) => {
  const code = normalizeDepartmentCode(value);
  return departmentByCode.get(code) || departmentByCode.get('JNTUGV');
};

const textDepartmentPatterns = [
  ['DAAP', /^(DAA&P|DAAP|ACADEMICS?)\s*[-:–—]/i],
  ['DRD', /^(DR&D|DRD|RESEARCH)\s*[-:–—]/i],
  ['DA', /^(DA|ADMISSIONS?)\s*[-:–—]/i],
  ['CE', /^(CE|DE|EXAMS?|EXAMINATIONS?)\s*[-:–—]/i],
  ['DAR', /^(DAR|ALUMNI(?:\s+RELATIONS?)?)\s*[-:–—]/i],
  ['DIQAC', /^(DIQAC|IQAC|INTERNAL\s+QUALITY|QUALITY)\s*[-:–—]/i],
  ['PLACEMENTS', /^(PLACEMENTS?|TRAINING\s+AND\s+PLACEMENT|TNP)\s*[-:–—]/i],
  ['JNTUGV', /^(JNTU-GV|JNTUGV)\s*[-:–—]/i],
];

const inferDepartmentCode = (record = {}) => {
  const storedDepartment = normalizeDepartmentCode(record.department);
  if (storedDepartment !== 'JNTUGV') return storedDepartment;

  const title = String(record.title || '');
  const externalLink = String(record.external_link || record.external_lnk || '').toLowerCase();
  const externalText = String(record.external_text || record.external_txt || '').toLowerCase();
  const updateType = String(record.update_type || record.type_of_update || '').toLowerCase();
  const searchable = `${title} ${externalText}`.toLowerCase();

  for (const [code, pattern] of textDepartmentPatterns) {
    if (pattern.test(title.trim())) return code;
  }

  if (
    externalLink.includes('exams.jntugv.edu.in') ||
    /\b(revaluation|challenge valuation|examinations?|results?|time tables?|certificates?)\b/i.test(searchable) ||
    ['exams', 'examination', 'examination_notification', 'result', 'time_table', 'revaluation_challenge_valuation'].includes(updateType)
  ) {
    return 'CE';
  }

  if (/\b(academic calendar|regulations?|course structures?|syllabi|syllabus)\b/i.test(searchable)) return 'DAAP';
  if (/\b(jrf|srf|serb|research project|grants?|funding|workshops?)\b/i.test(searchable)) return 'DRD';
  if (/\b(admission|prospectus|eligibility|counselling|merit list|selected list)\b/i.test(searchable)) return 'DA';
  if (/\b(alumni|reunion|chapters?)\b/i.test(searchable)) return 'DAR';
  if (/\b(naac|nba|aqar|iqac|quality|accreditation|ranking)\b/i.test(searchable)) return 'DIQAC';
  if (/\b(placement|campus recruitment|internship|job opportunit|company visit|pre-placement)\b/i.test(searchable)) return 'PLACEMENTS';

  return normalizeDepartmentCode(record.department);
};

const getDepartmentUpdateTypes = (departmentCode) => getDepartment(departmentCode).updateTypes;

const normalizeUpdateType = (value, departmentCode) => {
  const rawType = String(value || '').trim().toLowerCase();
  const type = legacyTypeAliases.get(rawType) || rawType;
  const updateTypes = getDepartmentUpdateTypes(departmentCode);
  const firstType = updateTypes[0]?.code || 'notification';

  if (!type) return firstType;
  return updateTypes.some((item) => item.code === type) ? type : firstType;
};

const getUpdateType = (value, departmentCode) => {
  const code = normalizeUpdateType(value, departmentCode);
  return getDepartmentUpdateTypes(departmentCode).find((item) => item.code === code) || {
    code,
    label: code,
  };
};

module.exports = {
  departments,
  getDepartment,
  getDepartmentUpdateTypes,
  getUpdateType,
  inferDepartmentCode,
  normalizeDepartmentCode,
  normalizeUpdateType,
};
