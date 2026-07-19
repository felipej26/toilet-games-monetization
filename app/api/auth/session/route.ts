import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAdminAuth, isEmailAllowed } from "@/lib/firebase/admin";

const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);

    if (!isEmailAllowed(decoded.email)) {
      return NextResponse.json({ error: "Unauthorized email" }, { status: 403 });
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ status: "ok" });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[auth/session]", error);
      const message =
        error instanceof Error ? error.message : "Invalid token";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
