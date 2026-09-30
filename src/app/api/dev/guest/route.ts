import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  DEV_GUEST_EMAIL,
  DEV_GUEST_NAME,
  DEV_GUEST_PASSWORD,
  isDevGuestEnabled,
} from "@/lib/dev-auth";
import { isSameOrigin } from "@/lib/security";

async function signInGuest(request: Request) {
  return auth.api.signInEmail({
    body: {
      email: DEV_GUEST_EMAIL,
      password: DEV_GUEST_PASSWORD,
    },
    headers: request.headers,
    asResponse: true,
  });
}

export async function POST(request: Request) {
  if (!isDevGuestEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const existing = await signInGuest(request);
    if (existing.ok) {
      return existing;
    }
  } catch {
    // guest user does not exist yet
  }

  try {
    const created = await auth.api.signUpEmail({
      body: {
        name: DEV_GUEST_NAME,
        email: DEV_GUEST_EMAIL,
        password: DEV_GUEST_PASSWORD,
        dateOfBirth: new Date("1990-01-01"),
      },
      headers: request.headers,
      asResponse: true,
    });
    if (created.ok) {
      return created;
    }
  } catch {
    // already exists — sign in below
  }

  try {
    return await signInGuest(request);
  } catch {
    return NextResponse.json(
      { error: "Could not start a developer session" },
      { status: 500 },
    );
  }
}
