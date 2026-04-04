import { auth0 } from '@/lib/auth0';

export async function GET(request) {
  return auth0.middleware(request);
}

export async function POST(request) {
  return auth0.middleware(request);
}