import { getBackendUrl } from '@/lib/backendUrl';

export async function GET() {
  try {
    const backend = getBackendUrl();
    return new Response(JSON.stringify({ backendUrl: backend }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'failed' }), { status: 500 });
  }
}
