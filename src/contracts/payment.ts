import { z } from 'zod';

/**
 * Canonical TEC payment contract — the Single Source of Truth (C-47 P1/P2).
 *
 * Every BFF route in every app (Hub, ecommerce, assets, commerce) MUST import
 * these schemas instead of re-declaring its own. This is what stops the
 * SDK ↔ gateway ↔ payment-service contract from diverging (Forbidden #5).
 *
 * Layering rule (P5): the BFF coerces `amount` from string (URL params) to a
 * number ONCE, at the boundary. Below the BFF — gateway, service, DB — `amount`
 * is always a number. tec-payment-service stores it on a DECIMAL column.
 */

// ── Primitives ────────────────────────────────────────────────────────────
export const PaymentAmountSchema   = z.coerce.number().positive().finite();
export const PaymentCurrencySchema = z.literal('PI');
export const PaymentMethodSchema   = z.literal('pi');

export const PaymentMetadataSchema = z
  .object({
    app_source: z.string().optional(),
    product_id: z.string().optional(),
  })
  .passthrough();

// Pi Network identifier formats — used to validate SDK callbacks before any
// server call. Previously duplicated in every app's pi-payment.ts.
export const PI_PAYMENT_ID_REGEX = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
export const PI_TXID_REGEX       = /^[a-zA-Z0-9_-]{8,128}$/;

export const PiPaymentIdSchema = z.string().regex(PI_PAYMENT_ID_REGEX, 'Invalid Pi payment ID format');
export const PiTxidSchema      = z.string().regex(PI_TXID_REGEX, 'Invalid transaction ID format');

// ── Requests (what the BFF sends to the gateway) ──────────────────────────
export const CreatePaymentRequestSchema = z.object({
  amount:          PaymentAmountSchema,
  currency:        PaymentCurrencySchema.default('PI'),
  payment_method:  PaymentMethodSchema.default('pi'),
  source:          z.string().min(1).optional(),
  idempotency_key: z.string().uuid().optional(),
  metadata:        PaymentMetadataSchema.optional(),
});
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

export const ApprovePaymentRequestSchema = z.object({
  payment_id:    z.string().min(1),
  pi_payment_id: PiPaymentIdSchema,
});
export type ApprovePaymentRequest = z.infer<typeof ApprovePaymentRequestSchema>;

export const CompletePaymentRequestSchema = z.object({
  payment_id:     z.string().min(1),
  transaction_id: PiTxidSchema,
});
export type CompletePaymentRequest = z.infer<typeof CompletePaymentRequestSchema>;

// ── Canonical gateway routing (relative to API_GATEWAY_URL host root) ─────
// The gateway rewrites ^/api/payment → /payments. Always use the singular
// `/api/payment/*` form so the rewrite is clean across all apps.
export const PAYMENT_GATEWAY_PATHS = {
  create:   '/api/payment/create',
  approve:  '/api/payment/approve',
  complete: '/api/payment/complete',
  cancel:   '/api/payment/cancel',
} as const;

// The ONLY internal-auth header the API Gateway validates (C-47 §12).
// `x-service-secret` is NOT recognised — never use it.
export const INTERNAL_KEY_HEADER = 'x-internal-key';

/**
 * Build the canonical create-payment body forwarded to the gateway.
 * Guarantees `amount` is a number regardless of the inbound type.
 */
export function buildCreatePaymentBody(input: CreatePaymentRequest): {
  amount: number;
  currency: 'PI';
  payment_method: 'pi';
  metadata?: Record<string, unknown>;
} {
  return {
    amount:         Number(input.amount),
    currency:       input.currency ?? 'PI',
    payment_method: input.payment_method ?? 'pi',
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}
