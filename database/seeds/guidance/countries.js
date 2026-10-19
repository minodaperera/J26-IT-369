// Seed data for the Country collection.
// IMPORTANT: figures (fees, processing times, costs, ratings) are ILLUSTRATIVE STARTING VALUES for the
// prototype. Verify every country against the official embassy / immigration website before real use,
// and update `lastVerified` when you do.

const visitSteps = (country, portal) => [
  { order: 1, title: 'Check passport validity', description: 'Your passport should normally be valid for at least 6 months beyond your planned entry date and have blank pages.' },
  { order: 2, title: 'Confirm the visa type', description: `Confirm the correct visit/tourist visa category for ${country} on the official government source.` },
  { order: 3, title: 'Gather documents', description: 'Collect every item on the checklist: bank statements, employment letter, itinerary, accommodation proof, photos.' },
  { order: 4, title: 'Apply through the official channel', description: `Submit your application via ${portal}. Never pay unofficial agents "guaranteed visa" fees.` },
  { order: 5, title: 'Pay the visa fee', description: 'Pay only through the official payment page and keep the receipt.' },
  { order: 6, title: 'Biometrics / interview (if required)', description: 'Attend the biometrics appointment or interview with originals of all documents.' },
  { order: 7, title: 'Track and receive decision', description: 'Track the application, then check the visa details (name, dates, validity) carefully on receipt.' },
];

const workSteps = (country, portal) => [
  { order: 1, title: 'Verify the employer and job offer', description: 'Check the employer and recruiting agency are legitimate and registered (SLBFE-registered agency for Sri Lankan workers).' },
  { order: 2, title: 'Receive a valid employment contract', description: 'Contract must state salary, duration, duties and conditions. Have it reviewed before signing.' },
  { order: 3, title: 'Medical and police clearance', description: 'Complete the approved medical examination and obtain a police clearance report.' },
  { order: 4, title: 'Apply for the work permit / visa', description: `Employer or applicant submits the work-visa application via ${portal}.` },
  { order: 5, title: 'Register with SLBFE', description: 'Register your overseas employment with the Sri Lanka Bureau of Foreign Employment before departure.' },
  { order: 6, title: 'Pre-departure briefing and travel', description: 'Attend the pre-departure orientation, then book travel after visa approval only.' },
];

const visitDocs = [
  'Passport (valid 6+ months, 2 blank pages)', 'Completed visa application form', 'Recent passport-size photographs',
  'Bank statements (last 3-6 months)', 'Employment letter / business registration', 'Return flight itinerary',
  'Accommodation booking or invitation letter', 'Travel insurance',
];
const workDocs = [
  'Passport (valid 6+ months)', 'Signed employment contract', 'Medical certificate (approved centre)',
  'Police clearance report', 'Educational / professional certificates', 'Passport-size photographs',
  'Visa application form', 'SLBFE registration documents',
];

const C = (o) => ({
  name: o.name, slug: o.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/(^-|-$)/g, ''),
  isoNumeric: o.iso, isoAlpha3: o.a3, region: o.region,
  visaDifficulty: o.diff, safetyRating: o.safe, avgMonthlySalaryUSD: o.salary,
  embassy: { name: `${o.name} diplomatic mission for Sri Lanka`, phone: 'See official website', website: o.site },
  visaTypes: [
    { type: 'Visit Visa', category: 'visit', processingDays: o.visitDays, stayDuration: o.stay, requiredDocuments: visitDocs, steps: visitSteps(o.name, o.portal), visaFeeUSD: o.visitFee },
    { type: 'Work Visa', category: 'work', processingDays: o.workDays, stayDuration: 'Per contract (usually 1-3 years)', requiredDocuments: workDocs, steps: workSteps(o.name, o.portal), visaFeeUSD: o.workFee },
  ],
  costs: { agencyFeeUSD: o.agency, medicalUSD: o.med, airfareUSD: o.air, insuranceUSD: o.ins, policeClearanceUSD: 10, accommodationPerMonthUSD: o.acc, otherUSD: o.other },
  lastVerified: new Date('2026-01-01'),
});

module.exports = [
  C({ name: 'United Arab Emirates', iso: 784, a3: 'ARE', region: 'Middle East', diff: 3, safe: 5, salary: 750, site: 'https://icp.gov.ae', portal: 'the ICP / GDRFA official portal', visitDays: { min: 3, max: 7 }, stay: '30-90 days', visitFee: 100, workDays: { min: 14, max: 30 }, workFee: 300, agency: 400, med: 80, air: 350, ins: 40, acc: 500, other: 150 }),
  C({ name: 'Qatar', iso: 634, a3: 'QAT', region: 'Middle East', diff: 3, safe: 5, salary: 700, site: 'https://portal.moi.gov.qa', portal: 'the Hayya / MOI official portal', visitDays: { min: 3, max: 10 }, stay: '30 days', visitFee: 30, workDays: { min: 14, max: 35 }, workFee: 250, agency: 350, med: 90, air: 380, ins: 40, acc: 450, other: 150 }),
  C({ name: 'Saudi Arabia', iso: 682, a3: 'SAU', region: 'Middle East', diff: 3, safe: 4, salary: 600, site: 'https://visa.mofa.gov.sa', portal: 'the Saudi eVisa portal', visitDays: { min: 3, max: 10 }, stay: 'Up to 90 days', visitFee: 120, workDays: { min: 21, max: 45 }, workFee: 300, agency: 450, med: 100, air: 400, ins: 45, acc: 400, other: 150 }),
  C({ name: 'Kuwait', iso: 414, a3: 'KWT', region: 'Middle East', diff: 4, safe: 4, salary: 550, site: 'https://evisa.moi.gov.kw', portal: 'the Kuwait eVisa portal', visitDays: { min: 5, max: 14 }, stay: '30-90 days', visitFee: 25, workDays: { min: 21, max: 45 }, workFee: 250, agency: 400, med: 90, air: 400, ins: 40, acc: 400, other: 150 }),
  C({ name: 'Oman', iso: 512, a3: 'OMN', region: 'Middle East', diff: 3, safe: 5, salary: 500, site: 'https://evisa.rop.gov.om', portal: 'the Royal Oman Police eVisa', visitDays: { min: 2, max: 7 }, stay: '14-30 days', visitFee: 20, workDays: { min: 14, max: 30 }, workFee: 200, agency: 350, med: 80, air: 380, ins: 35, acc: 350, other: 120 }),
  C({ name: 'Malaysia', iso: 458, a3: 'MYS', region: 'Asia', diff: 2, safe: 4, salary: 650, site: 'https://www.imi.gov.my', portal: 'the Malaysia eVisa / eNTRI portal', visitDays: { min: 3, max: 10 }, stay: '30 days', visitFee: 40, workDays: { min: 21, max: 60 }, workFee: 200, agency: 300, med: 70, air: 250, ins: 30, acc: 400, other: 100 }),
  C({ name: 'Singapore', iso: 702, a3: 'SGP', region: 'Asia', diff: 4, safe: 5, salary: 1500, site: 'https://www.ica.gov.sg', portal: 'the ICA SG Arrival / visa portal', visitDays: { min: 3, max: 7 }, stay: '30 days', visitFee: 30, workDays: { min: 21, max: 60 }, workFee: 150, agency: 500, med: 90, air: 300, ins: 30, acc: 900, other: 150 }),
  C({ name: 'Thailand', iso: 764, a3: 'THA', region: 'Asia', diff: 2, safe: 4, salary: 600, site: 'https://www.thaievisa.go.th', portal: 'the Thai e-Visa portal', visitDays: { min: 5, max: 14 }, stay: '30-60 days', visitFee: 40, workDays: { min: 21, max: 45 }, workFee: 150, agency: 250, med: 60, air: 280, ins: 30, acc: 350, other: 100 }),
  C({ name: 'Japan', iso: 392, a3: 'JPN', region: 'Asia', diff: 4, safe: 5, salary: 1900, site: 'https://www.mofa.go.jp', portal: 'the Embassy of Japan visa section', visitDays: { min: 5, max: 10 }, stay: '15-90 days', visitFee: 25, workDays: { min: 30, max: 90 }, workFee: 30, agency: 500, med: 100, air: 650, ins: 50, acc: 900, other: 200 }),
  C({ name: 'South Korea', iso: 410, a3: 'KOR', region: 'Asia', diff: 4, safe: 5, salary: 1800, site: 'https://www.visa.go.kr', portal: 'the Korea Visa Portal', visitDays: { min: 7, max: 15 }, stay: '30-90 days', visitFee: 40, workDays: { min: 30, max: 90 }, workFee: 60, agency: 450, med: 100, air: 650, ins: 50, acc: 800, other: 200 }),
  C({ name: 'United Kingdom', iso: 826, a3: 'GBR', region: 'Europe', diff: 5, safe: 4, salary: 2800, site: 'https://www.gov.uk/standard-visitor', portal: 'the UK Visas and Immigration (gov.uk) portal', visitDays: { min: 15, max: 21 }, stay: 'Up to 6 months', visitFee: 140, workDays: { min: 21, max: 56 }, workFee: 600, agency: 600, med: 150, air: 750, ins: 70, acc: 1400, other: 250 }),
  C({ name: 'Germany', iso: 276, a3: 'DEU', region: 'Europe', diff: 4, safe: 4, salary: 2600, site: 'https://colombo.diplo.de', portal: 'the German Missions visa portal', visitDays: { min: 15, max: 45 }, stay: 'Up to 90 days (Schengen)', visitFee: 90, workDays: { min: 30, max: 90 }, workFee: 75, agency: 550, med: 120, air: 700, ins: 60, acc: 1200, other: 250 }),
  C({ name: 'Italy', iso: 380, a3: 'ITA', region: 'Europe', diff: 4, safe: 4, salary: 2000, site: 'https://vistoperitalia.esteri.it', portal: 'the Italian visa portal', visitDays: { min: 15, max: 45 }, stay: 'Up to 90 days (Schengen)', visitFee: 90, workDays: { min: 45, max: 120 }, workFee: 75, agency: 550, med: 120, air: 720, ins: 60, acc: 1100, other: 250 }),
  C({ name: 'Australia', iso: 36, a3: 'AUS', region: 'Oceania', diff: 5, safe: 5, salary: 3200, site: 'https://immi.homeaffairs.gov.au', portal: 'ImmiAccount (Home Affairs)', visitDays: { min: 20, max: 40 }, stay: 'Up to 3-12 months', visitFee: 105, workDays: { min: 30, max: 120 }, workFee: 1100, agency: 700, med: 200, air: 900, ins: 80, acc: 1500, other: 300 }),
  C({ name: 'Canada', iso: 124, a3: 'CAN', region: 'North America', diff: 5, safe: 5, salary: 3000, site: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', portal: 'the IRCC online portal', visitDays: { min: 30, max: 90 }, stay: 'Up to 6 months', visitFee: 75, workDays: { min: 60, max: 180 }, workFee: 115, agency: 700, med: 200, air: 1000, ins: 80, acc: 1500, other: 300 }),
];
