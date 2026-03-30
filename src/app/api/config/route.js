export async function GET() {
  try {
    const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return new Response(JSON.stringify({ backendUrl: backend }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'failed' }), { status: 500 });
  }
}
