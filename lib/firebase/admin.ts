import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

interface ServiceAccountLike {
  private_key?: string;
  client_email?: string;
  project_id?: string;
}

function normalizeServiceAccount(
  serviceAccount: ServiceAccountLike,
): ServiceAccountLike {
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    );
  }
  return serviceAccount;
}

function loadServiceAccount(): ServiceAccountLike | null {
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (filePath) {
    const absolutePath = resolve(process.cwd(), filePath);
    return normalizeServiceAccount(
      JSON.parse(readFileSync(absolutePath, "utf8")) as ServiceAccountLike,
    );
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return normalizeServiceAccount(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccountLike,
    );
  }

  return null;
}

function createAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  return initializeApp({ projectId });
}

export function getAdminAuth() {
  return getAuth(createAdminApp());
}

export function getAllowedEmails(): string[] {
  const raw = process.env.ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | undefined): boolean {
  if (!email) {
    return false;
  }
  const allowed = getAllowedEmails();
  if (allowed.length === 0) {
    return false;
  }
  return allowed.includes(email.toLowerCase());
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifyIdToken(token);
}
