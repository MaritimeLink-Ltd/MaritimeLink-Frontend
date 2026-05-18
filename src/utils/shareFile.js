/**
 * Share a file via the Web Share API when supported (mainly mobile),
 * otherwise trigger a download so the user can attach the file manually.
 */

function canShareFiles(file) {
  if (!navigator.share || typeof File === 'undefined') return false;
  try {
    return Boolean(navigator.canShare?.({ files: [file] }));
  } catch {
    return false;
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * @param {Object} options
 * @param {Blob} options.blob
 * @param {string} options.fileName
 * @param {string} [options.title]
 * @param {string} [options.text]
 * @returns {Promise<'shared' | 'downloaded' | 'cancelled'>}
 */
export async function shareOrDownloadFile({
  blob,
  fileName,
  title = 'Shared file',
  text = '',
}) {
  const file = new File([blob], fileName, {
    type: blob.type || 'application/octet-stream',
  });

  if (canShareFiles(file)) {
    try {
      await navigator.share({ title, text, files: [file] });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // Fall through — desktop browsers often reject file share after canShare passes.
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: text || `Sharing ${fileName}`,
      });
      downloadBlob(blob, fileName);
      return 'downloaded';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }

  downloadBlob(blob, fileName);
  return 'downloaded';
}
