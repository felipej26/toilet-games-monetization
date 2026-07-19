import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAdminAuth, isEmailAllowed } from "@/lib/firebase/admin";
import { getEarningsSummary } from "@/lib/admob/reports";

async function authenticateRequest(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      return isEmailAllowed(decoded.email);
    } catch {
      return false;
    }
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return false;
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return isEmailAllowed(decoded.email);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await authenticateRequest(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const earnings = await getEarningsSummary();
    return NextResponse.json(earnings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch earnings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
