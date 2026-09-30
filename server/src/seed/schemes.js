export const defaultSchemes = () => {
  const openDate = new Date(); openDate.setDate(openDate.getDate() - 30);
  const closeDate = new Date(); closeDate.setDate(closeDate.getDate() + 90);
  return [
{
      code: 'ARG45',
      name: 'National Fellowship for ST Students (NFST)',
      description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities, IITs, NITs, and National Institutes across Sciences, Humanities, and Engineering.',
      level: 'phd',
      schemeType: 'Central Sector Scheme',
      benefitType: 'In Cash (DBT Monthly Stipend)',
      category: 'National Research Fellowship',
      isActive: true,
      openDate,
      closeDate,
      totalSeats: 750,
      stipendAmountPerYear: 384000, // Rs. 32,000/month JRF
      formFields: [
        { key: 'researchTopic', label: 'Proposed Research Topic / Thesis Title', type: 'text', required: true, helpText: 'Enter your research specialization or synopsis title' },
        { key: 'university', label: 'Indian University / Institute of National Importance', type: 'text', required: true },
        { key: 'course', label: 'Degree Programme', type: 'select', options: ['Ph.D. Full Time', 'Integrated Ph.D.', 'M.Phil + Ph.D.'], required: true },
        { key: 'marksPercent', label: 'Postgraduate Aggregate Percentage', type: 'number', required: true },
        { key: 'entranceScore', label: 'UGC-NET / CSIR / GATE Score', type: 'number', required: false, helpText: 'Enter percentile or qualifying score if applicable' },
        { key: 'familyIncome', label: 'Total Annual Family Income (INR)', type: 'number', required: true },
        { key: 'researchGuide', label: 'Supervisor / Guide Name & Designation', type: 'text', required: true }
      ],
      requiredDocuments: [
        { key: 'caste_certificate', label: 'ST Community / Tribe Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['certificate_no', 'issue_date', 'category', 'holder_name'], required: true },
        { key: 'income_certificate', label: 'Competent Authority Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'issue_date', 'issuing_authority'], required: true },
        { key: 'marksheet', label: 'Master\'s / Qualifying Degree Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['percentage', 'roll_number', 'university', 'year_of_passing'], required: true },
        { key: 'aadhaar', label: 'Aadhaar Card (Proof of Identity)', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aadhaarLast4'], required: true },
        { key: 'bank_passbook', label: 'Bank Account Passbook / Cancelled Cheque', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['account_no', 'ifsc', 'holder_name'], required: true }
      ],
      eligibilityRules: [
        { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to a Scheduled Tribe (ST)' },
        { field: 'familyIncome', operator: 'lte', value: 800000, message: 'Total annual family income must not exceed Rs 8,00,000' },
        { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% aggregate marks required in Master degree' },
        { field: 'age', operator: 'lte', value: 36, message: 'Maximum age limit is 36 years as of closing date' },
        { field: 'educationLevel', operator: 'in', value: ['masters', 'phd'], message: 'Open to candidates who have completed Masters or enrolled in PhD' }
      ],
      meritWeights: {
        marksPercent: 0.50,
        entranceScore: 0.30,
        interviewScore: 0.20
      },
      reservationQuota: {
        female: 0.30,
        disability: 0.04,
        pvtg: 0.05
      }
    },
{
      code: 'AZKMI',
      name: 'National Overseas Scholarship for ST Students (NOS)',
      description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research programmes in recognized foreign Universities/Institutions abroad in Top 500 QS/THE World Rankings.',
      level: 'masters',
      schemeType: 'Central Sector Scheme',
      benefitType: 'In Cash (Tuition Fee + Living Allowance Abroad)',
      category: 'International Overseas Scholarship',
      isActive: true,
      openDate,
      closeDate,
      totalSeats: 20,
      stipendAmountPerYear: 1800000, // ~18L annual tuition & stipend support abroad
      formFields: [
        { key: 'studyCountry', label: 'Destination Country', type: 'select', options: ['United Kingdom', 'United States', 'Australia', 'Canada', 'Germany', 'Singapore', 'New Zealand'], required: true },
        { key: 'foreignUniversity', label: 'Foreign University / Institution Name', type: 'text', required: true },
        { key: 'course', label: 'Overseas Degree Programme', type: 'text', required: true },
        { key: 'admissionStatus', label: 'Admission Offer Type', type: 'select', options: ['Unconditional Offer', 'Conditional Offer'], required: true },
        { key: 'marksPercent', label: 'Qualifying Bachelor\'s / Master\'s Percentage', type: 'number', required: true },
        { key: 'greGmatScore', label: 'GRE / GMAT / IELTS / TOEFL Score', type: 'number', required: false },
        { key: 'familyIncome', label: 'Total Annual Family Income (INR)', type: 'number', required: true }
      ],
      requiredDocuments: [
        { key: 'caste_certificate', label: 'ST Community / Tribe Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['certificate_no', 'issue_date', 'category', 'holder_name'], required: true },
        { key: 'income_certificate', label: 'Income Certificate (Valid for Current Year)', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'issue_date', 'issuing_authority'], required: true },
        { key: 'offer_letter', label: 'Foreign University Unconditional/Conditional Offer Letter', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['university', 'country', 'programme', 'start_date'], required: true },
        { key: 'marksheet', label: 'Qualifying Degree Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['percentage', 'university', 'year_of_passing'], required: true },
        { key: 'aadhaar', label: 'Aadhaar Card Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aadhaarLast4'], required: true },
        { key: 'bank_passbook', label: 'Bank Account Passbook Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['account_no', 'ifsc', 'holder_name'], required: true }
      ],
      eligibilityRules: [
        { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to a Scheduled Tribe' },
        { field: 'familyIncome', operator: 'lte', value: 600000, message: 'Family income must not exceed Rs 6,00,000 per annum' },
        { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% marks or equivalent grade required in qualifying degree' },
        { field: 'age', operator: 'lte', value: 35, message: 'Maximum age 35 years as of 1st July of selection year' },
        { field: 'educationLevel', operator: 'in', value: ['bachelors', 'masters', 'phd'], message: 'Open to Masters and PhD overseas programmes only' }
      ],
      meritWeights: {
        marksPercent: 0.50,
        entranceScore: 0.30,
        interviewScore: 0.20
      },
      reservationQuota: {
        female: 0.30,
        disability: 0.04,
        pvtg: 0.05
      }
    },
{
      code: 'A023B',
      name: 'Top Class Education for ST Students',
      description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance (Rs. 3,000/month), and a one-time computer grant (Rs. 45,000) to ST students admitted into 265+ notified premier institutions (IITs, IIMs, AIIMS, NITs, NLUs).',
      level: 'undergraduate',
      schemeType: 'Central Sector Scheme',
      benefitType: 'In Cash (Full Institute Fees + Living Allowance + Hardware Grant)',
      category: 'Premier Institution Scholarship',
      isActive: true,
      openDate,
      closeDate,
      totalSeats: 1000,
      stipendAmountPerYear: 320000,
      formFields: [
        { key: 'university', label: 'Notified Premier Institution (IIT/IIM/NIT/AIIMS)', type: 'text', required: true },
        { key: 'course', label: 'Degree Programme (B.Tech / MBBS / MBA / LLB / B.Des)', type: 'text', required: true },
        { key: 'marksPercent', label: 'Qualifying 12th / Degree Aggregate Percentage', type: 'number', required: true },
        { key: 'entranceScore', label: 'JEE / NEET / CAT / CLAT Rank Score', type: 'number', required: false },
        { key: 'familyIncome', label: 'Total Annual Family Income (INR)', type: 'number', required: true }
      ],
      requiredDocuments: [
        { key: 'caste_certificate', label: 'ST Community / Tribe Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['certificate_no', 'issue_date', 'category', 'holder_name'], required: true },
        { key: 'income_certificate', label: 'Income Certificate (Valid for Current Year)', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'issue_date', 'issuing_authority'], required: true },
        { key: 'marksheet', label: 'Class 12th / Qualifying Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['percentage', 'roll_number', 'university', 'year_of_passing'], required: true },
        { key: 'aadhaar', label: 'Aadhaar Card Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aadhaarLast4'], required: true },
        { key: 'bank_passbook', label: 'Bank Account Passbook Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['account_no', 'ifsc', 'holder_name'], required: true }
      ],
      eligibilityRules: [
        { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
        { field: 'familyIncome', operator: 'lte', value: 600000, message: 'Family income must not exceed Rs 6,00,000 per annum' },
        { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% aggregate marks required in qualifying examination' },
        { field: 'educationLevel', operator: 'in', value: ['12th', 'bachelors', 'masters', 'undergraduate'], message: 'Enrolled in 265+ notified premier institutions' }
      ],
      meritWeights: { marksPercent: 0.60, entranceScore: 0.40 },
      reservationQuota: { female: 0.30, disability: 0.05, pvtg: 0.05 }
    },
{
      code: 'BVOBC',
      name: 'Post-Matric Scholarship Scheme for ST Students',
      description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) to provide financial assistance to Scheduled Tribe students studying at post-matriculation or post-secondary stages (Classes 11th, 12th, ITI, Diploma, Undergraduate and Postgraduate courses).',
      level: 'higher_secondary',
      schemeType: 'Centrally Sponsored Scheme',
      benefitType: 'In Cash (DBT Maintenance Allowance & Compulsory Fees)',
      category: 'Centrally Sponsored Post-Matric',
      isActive: true,
      openDate,
      closeDate,
      totalSeats: 50000,
      stipendAmountPerYear: 35000,
      formFields: [
        { key: 'university', label: 'College / University / Polytechnic Institute Name', type: 'text', required: true },
        { key: 'course', label: 'Degree / Diploma / Class Programme', type: 'text', required: true },
        { key: 'marksPercent', label: 'Previous Class Passing Aggregate Percentage', type: 'number', required: true },
        { key: 'familyIncome', label: 'Total Annual Family Income (INR)', type: 'number', required: true }
      ],
      requiredDocuments: [
        { key: 'caste_certificate', label: 'ST Community / Tribe Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['certificate_no', 'issue_date', 'category', 'holder_name'], required: true },
        { key: 'income_certificate', label: 'Income Certificate (Family income <= 2.5 Lakhs)', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'issue_date', 'issuing_authority'], required: true },
        { key: 'marksheet', label: 'Previous Class Qualifying Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['percentage', 'roll_number', 'university', 'year_of_passing'], required: true },
        { key: 'aadhaar', label: 'Aadhaar Card Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aadhaarLast4'], required: true },
        { key: 'bank_passbook', label: 'Bank Account Passbook Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['account_no', 'ifsc', 'holder_name'], required: true }
      ],
      eligibilityRules: [
        { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
        { field: 'familyIncome', operator: 'lte', value: 250000, message: 'Family income must not exceed Rs 2,50,000 per annum' },
        { field: 'marksPercent', operator: 'gte', value: 45, message: 'Must have passed previous annual examination' }
      ],
      meritWeights: { marksPercent: 0.80, entranceScore: 0.20 },
      reservationQuota: { female: 0.30, disability: 0.05, pvtg: 0.05 }
    },
{
      code: 'BPVGK',
      name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
      description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools to minimize transition drop-out rates, with direct cash benefits for day scholars and hostellers.',
      level: '10th',
      schemeType: 'Centrally Sponsored Scheme',
      benefitType: 'In Cash (DBT School Allowance & Book Grant)',
      category: 'Centrally Sponsored Pre-Matric',
      isActive: true,
      openDate,
      closeDate,
      totalSeats: 100000,
      stipendAmountPerYear: 7000,
      formFields: [
        { key: 'university', label: 'School Name & District', type: 'text', required: true },
        { key: 'course', label: 'Current Class (Class IX / Class X)', type: 'select', options: ['Class IX', 'Class X'], required: true },
        { key: 'marksPercent', label: 'Previous Class Passing Aggregate Percentage', type: 'number', required: true },
        { key: 'familyIncome', label: 'Total Annual Family Income (INR)', type: 'number', required: true }
      ],
      requiredDocuments: [
        { key: 'caste_certificate', label: 'ST Community / Tribe Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['certificate_no', 'issue_date', 'category', 'holder_name'], required: true },
        { key: 'income_certificate', label: 'Income Certificate (Family income <= 2.5 Lakhs)', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'issue_date', 'issuing_authority'], required: true },
        { key: 'marksheet', label: 'Previous Class Passing Marksheet / School Report', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['percentage', 'roll_number', 'university', 'year_of_passing'], required: true },
        { key: 'aadhaar', label: 'Student / Parent Aadhaar Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aadhaarLast4'], required: true },
        { key: 'bank_passbook', label: 'Aadhaar-Seeded Bank Account Passbook Copy', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['account_no', 'ifsc', 'holder_name'], required: true }
      ],
      eligibilityRules: [
        { field: 'category', operator: 'equals', value: 'ST', message: 'Student must belong to Scheduled Tribe (ST)' },
        { field: 'familyIncome', operator: 'lte', value: 250000, message: 'Annual family income must not exceed Rs 2,50,000' },
        { field: 'marksPercent', operator: 'gte', value: 40, message: 'Must have passed previous annual school exam' }
      ],
      meritWeights: { marksPercent: 1.0 },
      reservationQuota: { female: 0.30, disability: 0.05, pvtg: 0.05 }
    }
  ];
};
