import { timingSafeEqual } from 'node:crypto';

const matches = (given, expected) => {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

const keyOf = (request) => request.headers.get('x-gallery-key');

export const isAdmin = (request) => matches(keyOf(request), process.env.ADMIN_PASSWORD);

export const isViewer = (request) =>
  isAdmin(request) || matches(keyOf(request), process.env.GALLERY_PASSWORD || 'chud');

export const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 });

export const isSelfiePath = (path) => typeof path === 'string' && /^selfies\/[\w.-]+\.jpg$/.test(path);
