import { PAYMENT_PROVIDER_IDS, type PaymentProviderId } from "@/lib/payments/types";

const IMPLEMENTED_PROVIDERS: PaymentProviderId[] = ["stripe"];

export function resolvePaymentProviderId(env: NodeJS.ProcessEnv = process.env): PaymentProviderId {
  const explicit = env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (explicit === "stripe" || explicit === "ccbill" || explicit === "segpay") {
    return explicit;
  }
  if (env.STRIPE_SECRET_KEY?.trim()) {
    return "stripe";
  }
  return "stripe";
}

export function paymentProviderEnvErrors(env: NodeJS.ProcessEnv = process.env) {
  const errors: string[] = [];
  const explicit = env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (explicit && !PAYMENT_PROVIDER_IDS.includes(explicit as PaymentProviderId)) {
    errors.push(`PAYMENT_PROVIDER must be one of: ${PAYMENT_PROVIDER_IDS.join(", ")}`);
    return errors;
  }

  const provider = resolvePaymentProviderId(env);

  const required = (name: string) => {
    if (!env[name]?.trim()) errors.push(`${name} is required when PAYMENT_PROVIDER=${provider}`);
  };

  switch (provider) {
    case "stripe":
      required("STRIPE_SECRET_KEY");
      required("STRIPE_WEBHOOK_SECRET");
      break;
    case "ccbill":
      required("CCBILL_ACCOUNT_NUMBER");
      required("CCBILL_SUB_ACCOUNT");
      required("CCBILL_WEBHOOK_SECRET");
      break;
    case "segpay":
      required("SEGPAY_MERCHANT_ID");
      required("SEGPAY_WEBHOOK_SECRET");
      break;
  }

  if (!IMPLEMENTED_PROVIDERS.includes(provider)) {
    errors.push(`PAYMENT_PROVIDER "${provider}" is not implemented yet`);
  }

  return errors;
}
