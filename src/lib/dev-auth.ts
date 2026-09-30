export const DEV_GUEST_EMAIL = "dev@fembo.local";
export const DEV_GUEST_PASSWORD = "FemboDevGuest12";
export const DEV_GUEST_NAME = "Developer";

export function isDevGuestEnabled() {
  return process.env.NODE_ENV !== "production";
}
