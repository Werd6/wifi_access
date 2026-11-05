import { put } from '@vercel/blob';

const MAX_BYTES = 1024 * 1024;

export async function POST(request) {
  if (request.headers.get('content-type') !== 'image/jpeg') {
    return Response.json({ error: 'Expected image/jpeg' }, { status: 415 });
  }
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0 || body.length > MAX_BYTES) {
    return Response.json({ error: 'Image is empty or too large' }, { status: 413 });
  }
  if (body[0] !== 0xff || body[1] !== 0xd8 || body[2] !== 0xff) {
    return Response.json({ error: 'Not a JPEG' }, { status: 415 });
  }
  try {
    await put(`selfies/${Date.now()}.jpg`, body, {
      access: 'private',
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Selfie upload failed:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
