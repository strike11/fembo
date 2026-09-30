export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionEnv } = await import("@/lib/env");
    try {
      assertProductionEnv();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      if (process.env.NODE_ENV === "production") throw error;
    }
  }
}
