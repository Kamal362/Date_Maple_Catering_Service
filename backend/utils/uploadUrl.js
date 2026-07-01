/**
 * Generate a relative upload URL that works in any environment.
 *
 * Storing absolute URLs (e.g. http://localhost:5000/uploads/... or an EC2 IP)
 * breaks when the backend host changes. Relative paths let the frontend resolve
 * them against the current API origin (or Vite proxy in dev).
 */
const getUploadUrl = (filename) => {
  if (!filename) return '';

  // If it's already a relative path, return it as-is
  if (filename.startsWith('/uploads/')) {
    return filename;
  }

  // If it's an absolute URL, extract only the /uploads/... path
  try {
    const url = new URL(filename);
    if (url.pathname.startsWith('/uploads/')) {
      return url.pathname;
    }
  } catch (err) {
    // Not a valid URL - treat it as a raw filename and prefix /uploads/
  }

  // Raw filename without path - prefix /uploads/
  return `/uploads/${filename}`;
};

module.exports = { getUploadUrl };
