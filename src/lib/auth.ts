import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";

import { APIError, createAuthMiddleware } from "better-auth/api";

import { nextCookies } from "better-auth/next-js";

import { trackEvent, trackReturnVisit } from "@/lib/analytics";

import { writeAudit } from "@/lib/audit";

import { prisma } from "@/lib/db";

import { notify } from "@/lib/notify";

import { hashPassword, verifyPassword } from "@/lib/security";

import { COMMON_PASSWORDS, isAtLeast16, registerSchema } from "@/lib/validation";



export const auth = betterAuth({

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],

  emailAndPassword: {

    enabled: true,

    minPasswordLength: 12,

    maxPasswordLength: 128,

    password: {

      hash: hashPassword,

      verify: async ({ hash, password }) => verifyPassword(password, hash),

    },

  },

  user: {

    additionalFields: {

      dateOfBirth: {

        type: "date",

        required: true,

      },

      ageConfirmedAt: {

        type: "date",

        required: false,

        input: false,

      },

      termsAcceptedAt: {

        type: "date",

        required: false,

        input: false,

      },

      lastLoginAt: {

        type: "date",

        required: false,

        input: false,

      },

    },

  },

  session: {

    expiresIn: 60 * 60 * 24 * 7,

    updateAge: 60 * 60 * 12,

    freshAge: 60 * 10,

    cookieCache: {

      enabled: true,

      maxAge: 60 * 5,

    },

  },

  advanced: {

    useSecureCookies: process.env.NODE_ENV === "production",

    defaultCookieAttributes: {

      httpOnly: true,

      sameSite: "lax",

      secure: process.env.NODE_ENV === "production",

    },

  },

  rateLimit: {

    enabled: true,

    window: 60,

    max: 10,

    customRules: {

      "/sign-in/email": { window: 60, max: 5 },

      "/sign-up/email": { window: 60, max: 3 },

    },

  },

  hooks: {

    before: createAuthMiddleware(async (ctx) => {

      if (ctx.path !== "/sign-up/email") {

        return;

      }

      const body = ctx.body as {

        name?: string;

        email?: string;

        password?: string;

        dateOfBirth?: string | Date;

      };

      const dobValue =

        body.dateOfBirth instanceof Date

          ? body.dateOfBirth.toISOString().slice(0, 10)

          : String(body.dateOfBirth ?? "");

      const parsed = registerSchema.safeParse({

        name: body.name,

        email: body.email,

        password: body.password,

        dateOfBirth: dobValue,

        ageConfirmed: true,

        termsAccepted: true,

      });

      if (!parsed.success) {

        throw new APIError("BAD_REQUEST", {

          message: parsed.error.issues[0]?.message ?? "Invalid registration",

        });

      }

      if (COMMON_PASSWORDS.has(parsed.data.password.toLowerCase())) {

        throw new APIError("BAD_REQUEST", {

          message: "Choose a less common password",

        });

      }

      const dob = new Date(`${parsed.data.dateOfBirth}T00:00:00`);

      if (!isAtLeast16(dob)) {

        throw new APIError("BAD_REQUEST", {

          message: "Fembo is only for people 16 or older",

        });

      }

    }),

  },

  databaseHooks: {

    user: {

      create: {

        before: async (user) => ({

          data: {

            ...user,

            ageConfirmedAt: new Date(),

            termsAcceptedAt: new Date(),

          },

        }),

        after: async (user) => {

          void trackEvent("signup", { userId: user.id });

        },

      },

    },

    session: {

      create: {

        after: async (session) => {

          try {

            const user = await prisma.user.update({

              where: { id: session.userId },

              data: { lastLoginAt: new Date() },

              select: { createdAt: true },

            });

            void trackReturnVisit(session.userId, user.createdAt);

            await writeAudit(session.userId, "session.create", session.userAgent ?? "");

            const [priorSameAgent, totalSessions] = await Promise.all([

              prisma.session.count({

                where: {

                  userId: session.userId,

                  userAgent: session.userAgent ?? "",

                  id: { not: session.id },

                },

              }),

              prisma.session.count({ where: { userId: session.userId } }),

            ]);

            if (totalSessions > 1 && priorSameAgent === 0) {

              await notify(

                session.userId,

                "New device",

                "A new browser just signed into your room.",

                "/app/sessions",

              );

            }

          } catch {

            /* login should still succeed */

          }

        },

      },

    },

  },

  plugins: [nextCookies()],

});

