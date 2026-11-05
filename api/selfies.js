import { del, get, list } from '@vercel/blob';
import { isAdmin, isSelfiePath, isViewer, unauthorized } from './_auth.js';

export async function GET(request) {
  if (!isViewer(request)) return unauthorized();
  const path = new URL(request.url).searchParams.get('path');
  try {
    if (!path) {
      const photos = [];
      let cursor;
      do {
        const page = await list({ prefix: 'selfies/', cursor });
        photos.push(...page.blobs.map(({ pathname, uploadedAt, size }) => ({ pathname, uploadedAt, size })));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      return Response.json({ photos, admin: isAdmin(request) }, { headers: { 'cache-control': 'no-store' } });
    }
    if (!isSelfiePath(path)) return Response.json({ error: 'Bad path' }, { status: 400 });
    const result = await get(path, { access: 'private' });
    if (!result || result.statusCode !== 200) return new Response('Not found', { status: 404 });
    return new Response(result.stream, {
      headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, no-store' },
    });
  } catch (err) {
    console.error('Selfie read failed:', err);
    return Response.json({ error: 'Read failed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdmin(request)) return unauthorized();
  const path = new URL(request.url).searchParams.get('path');
  if (!isSelfiePath(path)) return Response.json({ error: 'Bad path' }, { status: 400 });
  try {
    await del(path);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Selfie delete failed:', err);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
