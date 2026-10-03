import { auth } from '../config/firebaseConfig';

export const BLOG_API_URL = (process.env.REACT_APP_BLOG_API_URL || 'https://oneshot-backend.onrender.com').replace(/\/+$/, '');
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function request(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || body?.error?.message || `Image request failed (${response.status}).`);
    return body;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Image upload timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadBlogImage(file) {
  if (!file || !TYPES.includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (!file.size || file.size > MAX_BYTES) throw new Error('Choose an image smaller than or equal to 5 MB.');
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in before uploading an image.');
  const idToken = await user.getIdToken();
  const signed = await request(`${BLOG_API_URL}/uploads/signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  }, 90000);
  if (!signed?.cloudName || !signed?.apiKey || !signed?.signature || !signed?.params?.public_id) {
    throw new Error('The backend returned an invalid upload configuration.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('signature', signed.signature);
  Object.entries(signed.params).forEach(([key, value]) => form.append(key, String(value)));
  const uploaded = await request(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`, {
    method: 'POST', body: form,
  }, 120000);
  if (uploaded?.public_id !== signed.params.public_id || typeof uploaded?.secure_url !== 'string' || !uploaded.secure_url.startsWith('https://res.cloudinary.com/')) {
    throw new Error('Cloudinary did not return a valid image URL.');
  }
  return uploaded.secure_url;
}
