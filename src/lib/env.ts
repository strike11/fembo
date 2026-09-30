import { isAllowedOpenRouterModel } from "@/lib/chat-provider/model-allowlist";
import { paymentProviderEnvErrors } from "@/lib/payments/env";

type ProductionEnv = NodeJS.ProcessEnv;

function required(env: ProductionEnv, name: string, errors: string[]) {
  if (!env[name]?.trim()) errors.push(`${name} is required`);
}

function requireHttps(env: ProductionEnv, name: string, errors: string[]) {
  const value = env[name]?.trim();
  if (!value) {
    errors.push(`${name} is required`);
    return;
  }
  try {
    if (new URL(value).protocol !== "https:") {
      errors.push(`${name} must use https`);
    }
  } catch {
    errors.push(`${name} must be a valid URL`);
  }
}

export function productionEnvErrors(env: ProductionEnv = process.env) {
  const errors: string[] = [];
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
    errors.push("DATABASE_URL must be a PostgreSQL URL in production");
  }

  const authSecret = env.BETTER_AUTH_SECRET?.trim() ?? "";
  if (authSecret.length < 32) {
    errors.push("BETTER_AUTH_SECRET must be at least 32 characters");
  }
  requireHttps(env, "BETTER_AUTH_URL", errors);
  try {
    const hostname = new URL(env.BETTER_AUTH_URL ?? "").hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
      errors.push("BETTER_AUTH_URL must use a public hostname");
    }
  } catch {
    // URL shape is reported by requireHttps.
  }

  if (env.CHAT_PROVIDER?.trim().toLowerCase() !== "openrouter") {
    errors.push("CHAT_PROVIDER must be openrouter in production");
  }
  required(env, "OPENROUTER_API_KEY", errors);
  const openRouterModel = env.OPENROUTER_MODEL?.trim() ?? "";
  if (!openRouterModel) {
    errors.push("OPENROUTER_MODEL is required");
  } else if (!isAllowedOpenRouterModel(openRouterModel)) {
    errors.push("OPENROUTER_MODEL must be in the server allowlist");
  }

  errors.push(...paymentProviderEnvErrors(env));

  requireHttps(env, "STORAGE_ENDPOINT", errors);
  requireHttps(env, "STORAGE_PUBLIC_URL", errors);
  required(env, "STORAGE_BUCKET", errors);
  required(env, "STORAGE_ACCESS_KEY_ID", errors);
  required(env, "STORAGE_SECRET_ACCESS_KEY", errors);

  return errors;
}

export function assertProductionEnv(env: ProductionEnv = process.env) {
  if (env.NODE_ENV !== "production") return;
  const errors = productionEnvErrors(env);
  if (errors.length > 0) {
    throw new Error(`Invalid production environment:\n- ${errors.join("\n- ")}`);
  }
}

export function isMaintenanceMode() {
  return process.env.MAINTENANCE_MODE === "1";
}

export function houseExtrasEnabled(env: ProductionEnv = process.env) {
  const raw = env.HOUSE_EXTRAS_ENABLED?.trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes") return true;
  if (raw === "0" || raw === "false" || raw === "no") return false;
  return env.NODE_ENV !== "production";
}
