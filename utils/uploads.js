const crypto = require('crypto');
const path = require('path');

const extensionsByMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
};

const safeFilename = (file) => {
  const extension = extensionsByMime[file.mimetype];
  if (!extension) throw new Error('Unsupported file type');
  return `${Date.now()}-${crypto.randomUUID()}${extension}`;
};

const sanitizeOriginalFilename = (file) => {
  const extension = extensionsByMime[file.mimetype];
  if (!extension) throw new Error('Unsupported file type');

  const parsed = path.parse(file.originalname || `document${extension}`);
  const baseName = parsed.name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

  const safeBaseName = baseName || `document-${Date.now()}`;
  return `${safeBaseName}${extension}`;
};

const safeOriginalFilename = (file, directory) => {
  const filename = sanitizeOriginalFilename(file);
  const parsed = path.parse(filename);
  let candidate = filename;
  let copy = 2;

  while (directory && require('fs').existsSync(path.join(directory, candidate))) {
    candidate = `${parsed.name}-${copy}${parsed.ext}`;
    copy += 1;
  }

  return candidate;
};

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const notificationMimeTypes = new Set([...imageMimeTypes, 'application/pdf']);
const documentMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);
const pressNoteMimeTypes = new Set([...imageMimeTypes, ...documentMimeTypes]);

const fileFilterFor = (allowedTypes) => (req, file, callback) => {
  const allowed = allowedTypes.has(file.mimetype);
  callback(allowed ? null : new Error('Unsupported file type'), allowed);
};

const safeEventName = (value) => {
  const eventName = String(value || '').trim();
  if (!/^[a-zA-Z0-9 _-]{1,100}$/.test(eventName)) {
    throw new Error('Event name may contain only letters, numbers, spaces, hyphens, and underscores');
  }
  return eventName;
};

module.exports = {
  safeFilename,
  safeOriginalFilename,
  safeEventName,
  imageFileFilter: fileFilterFor(imageMimeTypes),
  notificationFileFilter: fileFilterFor(notificationMimeTypes),
  documentFileFilter: fileFilterFor(documentMimeTypes),
  pressNoteFileFilter: fileFilterFor(pressNoteMimeTypes),
};
