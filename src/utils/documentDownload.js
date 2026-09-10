import { jsPDF } from 'jspdf';

/**
 * Document Wallet accepts both PDF and photographed/scanned image uploads
 * (JPG/PNG/etc.), but a professional/recruiter/admin downloading a document
 * expects a PDF regardless of which one was originally uploaded. This wraps
 * any raster image in a single-page PDF at download time — the stored file
 * itself is never touched, so previews (which still want the raw image)
 * are unaffected.
 */
const RASTER_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
];

const sanitizeFileName = (value) =>
    String(value || 'document')
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_')
        .slice(0, 140) || 'document';

/** Strips a known document/image extension so we don't end up with "file.jpg.pdf". */
const stripKnownExtension = (name) =>
    sanitizeFileName(name).replace(/\.(pdf|jpe?g|png|webp|gif|bmp|heic)$/i, '');

const extensionFromUrl = (url) => {
    const match = String(url || '').toLowerCase().match(/\.([a-z0-9]{2,6})(?:\?|#|$)/);
    return match ? `.${match[1]}` : '';
};

/** Best-effort file type detection: the blob's own MIME type first, URL extension as a fallback. */
const detectType = (blob, url) => {
    const mime = String(blob?.type || '').toLowerCase();
    if (mime) return mime;
    const ext = extensionFromUrl(url).replace('.', '');
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (['png', 'webp', 'gif', 'bmp'].includes(ext)) return `image/${ext}`;
    return '';
};

const loadImageElement = (blobUrl) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not read image data'));
        img.src = blobUrl;
    });

/** Wraps a single raster image blob in a one-page PDF sized to the image, so nothing is cropped or stretched. */
export const imageBlobToPdfBlob = async (blob) => {
    const blobUrl = URL.createObjectURL(blob);
    try {
        const img = await loadImageElement(blobUrl);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) throw new Error('Could not read image dimensions');

        // Re-drawn through a canvas so jsPDF always gets a format it accepts
        // (JPEG), regardless of the source blob's original encoding.
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        const pdf = new jsPDF({
            orientation: width >= height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height],
        });
        pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
        return pdf.output('blob');
    } finally {
        URL.revokeObjectURL(blobUrl);
    }
};

/**
 * Converts a document blob to PDF when it's a raster image. Returns the
 * blob unchanged when it's already a PDF, or when it's a type the browser
 * can't safely rasterize (e.g. HEIC) — falling back to the original file
 * beats failing the download outright.
 */
export const ensurePdfBlob = async (blob, { url } = {}) => {
    const type = detectType(blob, url);
    if (type === 'application/pdf') {
        return { blob, extension: '.pdf' };
    }
    if (RASTER_IMAGE_TYPES.includes(type)) {
        try {
            const pdfBlob = await imageBlobToPdfBlob(blob);
            return { blob: pdfBlob, extension: '.pdf' };
        } catch (error) {
            console.error('Image-to-PDF conversion failed, downloading the original file instead:', error);
            return { blob, extension: extensionFromUrl(url) || `.${type.split('/')[1] || 'bin'}` };
        }
    }
    return { blob, extension: extensionFromUrl(url) };
};

/** Triggers the browser's native "save file" flow for an in-memory blob. */
export const saveBlob = (blob, filename) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};

/**
 * Fetches a document URL, converts it to PDF if it's a raster image, and
 * saves it via the browser's download prompt — the one entry point every
 * "Download document" button in the app should go through.
 */
export const downloadDocumentAsPdf = async (url, filename, { headers } = {}) => {
    if (!url) throw new Error('Document file not available.');

    const response = await fetch(url, headers ? { headers } : undefined);
    if (!response.ok) {
        throw new Error(`Failed to download file (${response.status} ${response.statusText})`);
    }

    const blob = await response.blob();
    const { blob: finalBlob, extension } = await ensurePdfBlob(blob, { url });

    const baseName = stripKnownExtension(filename);
    saveBlob(finalBlob, `${baseName}${extension}`);
};
