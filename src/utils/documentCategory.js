const STCW_KEYWORDS = [
    'stcw',
    'basic safety',
    'safety training',
    'advanced firefighting',
    'medical first aid',
    'proficiency in survival craft',
    'survival craft',
    'bridge resource management',
    'engine room resource management',
    'radar',
    'gmdss',
    'ship security',
    'crowd management',
    'passenger safety',
    'watchkeeping',
];

const normalizeText = (value) =>
    String(value || '').trim().toLowerCase();

const DISPLAY_CATEGORY_LABELS = {
    licenses: 'Licenses & Endorsements',
    stcw: 'STCW Certificates',
    medical: 'Medical Certificates',
    seaman: 'Seaman Book data/Stamp pages',
    travel: 'Travel Documents',
    academic: 'Academic Qualifications',
    company: 'Company Letters / Misc',
    appraisals: 'Recent Appraisals',
    resume: 'Resume',
    'cover-letter': 'Cover Letter',
};

const CATEGORY_FALLBACKS = {
    LICENSES_ENDORSEMENTS: 'licenses',
    MEDICAL_CERTIFICATES: 'medical',
    TRAVEL_DOCUMENTS: 'travel',
    SEAMANS_BOOK: 'seaman',
    ACADEMIC_QUALIFICATIONS: 'academic',
    MISC_COMPANY_LETTERS: 'company',
    RECENT_APPRAISALS: 'appraisals',
    CV_RESUME: 'resume',
    COVER_LETTER: 'cover-letter',
};

export const getDocumentDisplayCategory = (doc = {}) => {
    const normalizedCategory = normalizeText(
        doc.displayCategory ||
        doc.sourceCategory ||
        doc?.ocrData?.sourceCategory ||
        doc.category,
    );

    if (normalizedCategory in DISPLAY_CATEGORY_LABELS) {
        return normalizedCategory;
    }

    const directCategory = normalizedCategory.toUpperCase();

    const searchableText = [
        doc.name,
        doc.title,
        doc.fileName,
        doc.fileUrl,
        doc?.ocrData?.name,
        doc?.ocrData?.qualification,
        doc?.ocrData?.title,
        doc?.ocrData?.description,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (
        directCategory === 'STCW_CERTIFICATES' ||
        directCategory === 'STCW_CERTIFICATE' ||
        directCategory === 'STCW' ||
        searchableText.includes('stcw') ||
        STCW_KEYWORDS.some((keyword) => searchableText.includes(keyword))
    ) {
        return 'stcw';
    }

    return CATEGORY_FALLBACKS[directCategory] || 'company';
};

export const getDocumentCategoryLabel = (categoryId) => {
    return DISPLAY_CATEGORY_LABELS[categoryId] || 'Document';
};
