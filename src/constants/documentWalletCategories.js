/**
 * Professional document wallet ↔ Prisma `DocumentCategory` mapping.
 * The API rejects `STCW_CERTIFICATES` — it is not a valid enum value. STCW uploads and
 * queries use `ACADEMIC_QUALIFICATIONS` (same bucket as academic docs; aligns with
 * resume “Academic Qualifications & STCW Certificates”). When the backend adds a
 * dedicated STCW category, update WALLET_FOLDER_TO_API_CATEGORY and UPLOAD_TAB_TO_API_CATEGORY.
 */

export const WALLET_FOLDER_TO_API_CATEGORY = {
    licenses: 'LICENSES_ENDORSEMENTS',
    stcw: 'ACADEMIC_QUALIFICATIONS',
    medical: 'MEDICAL_CERTIFICATES',
    seaman: 'SEAMANS_BOOK',
    travel: 'TRAVEL_DOCUMENTS',
    academic: 'ACADEMIC_QUALIFICATIONS',
    company: 'MISC_COMPANY_LETTERS',
    appraisals: 'RECENT_APPRAISALS',
};

/** Each API category maps to one or more wallet folder ids (ACADEMIC is shared). */
export const API_CATEGORY_TO_WALLET_FOLDERS = {
    LICENSES_ENDORSEMENTS: ['licenses'],
    MEDICAL_CERTIFICATES: ['medical'],
    SEAMANS_BOOK: ['seaman'],
    TRAVEL_DOCUMENTS: ['travel'],
    ACADEMIC_QUALIFICATIONS: ['academic', 'stcw'],
    MISC_COMPANY_LETTERS: ['company'],
    RECENT_APPRAISALS: ['appraisals'],
    STCW_CERTIFICATES: ['stcw'],
};

export const UPLOAD_TAB_TO_API_CATEGORY = {
    'Licenses & Endorsements': 'LICENSES_ENDORSEMENTS',
    'STCW Certificates': 'ACADEMIC_QUALIFICATIONS',
    'Medical Certificates': 'MEDICAL_CERTIFICATES',
    'Seaman Book data/Stamp pages': 'SEAMANS_BOOK',
    'Travel Documents': 'TRAVEL_DOCUMENTS',
    'Academic Qualifications': 'ACADEMIC_QUALIFICATIONS',
    'Company Letters / Misc': 'MISC_COMPANY_LETTERS',
    'Recent Appraisals': 'RECENT_APPRAISALS',
};
