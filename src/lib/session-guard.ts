import { jsonError } from "@/lib/http";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";

export async function requireSession(request?: Request) {
  if (request && !isSameOrigin(request)) {
    return {
      session: null,
      response: jsonError("Invalid origin", 403, { request }),
    };
  }
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: jsonError("Sign in first", 401, { request }),
    };
  }
  return { session, response: null };
}
