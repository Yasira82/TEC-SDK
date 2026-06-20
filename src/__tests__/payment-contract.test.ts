import {
  CreatePaymentRequestSchema,
  ApprovePaymentRequestSchema,
  CompletePaymentRequestSchema,
  PaymentAmountSchema,
  PiPaymentIdSchema,
  PiTxidSchema,
  PAYMENT_GATEWAY_PATHS,
  INTERNAL_KEY_HEADER,
  buildCreatePaymentBody,
} from '../contracts/payment';

describe('payment contract — canonical SSOT', () => {
  describe('amount', () => {
    it('coerces a numeric string to a number', () => {
      expect(PaymentAmountSchema.parse('5')).toBe(5);
      expect(PaymentAmountSchema.parse('5.25')).toBe(5.25);
    });
    it('accepts a number', () => {
      expect(PaymentAmountSchema.parse(10)).toBe(10);
    });
    it('rejects zero, negative and non-finite', () => {
      expect(() => PaymentAmountSchema.parse(0)).toThrow();
      expect(() => PaymentAmountSchema.parse(-1)).toThrow();
      expect(() => PaymentAmountSchema.parse('abc')).toThrow();
    });
  });

  describe('CreatePaymentRequestSchema', () => {
    it('parses a valid body and defaults currency/method', () => {
      const r = CreatePaymentRequestSchema.parse({ amount: '5' });
      expect(r.amount).toBe(5);
      expect(r.currency).toBe('PI');
      expect(r.payment_method).toBe('pi');
    });
    it('keeps extra metadata via passthrough', () => {
      const r = CreatePaymentRequestSchema.parse({
        amount: 3,
        metadata: { app_source: 'ecommerce', product_id: 'p1', extra: 'x' },
      });
      expect(r.metadata).toMatchObject({ app_source: 'ecommerce', extra: 'x' });
    });
  });

  describe('approve / complete', () => {
    it('validates pi payment + txid formats', () => {
      expect(() =>
        ApprovePaymentRequestSchema.parse({ payment_id: 'id', pi_payment_id: 'good-id_1' }),
      ).not.toThrow();
      expect(() =>
        ApprovePaymentRequestSchema.parse({ payment_id: 'id', pi_payment_id: 'bad id!' }),
      ).toThrow();
      expect(() =>
        CompletePaymentRequestSchema.parse({ payment_id: 'id', transaction_id: 'abcd1234' }),
      ).not.toThrow();
      expect(() =>
        CompletePaymentRequestSchema.parse({ payment_id: 'id', transaction_id: 'short' }),
      ).toThrow();
    });
  });

  describe('format guards', () => {
    it('PiPaymentIdSchema / PiTxidSchema', () => {
      expect(PiPaymentIdSchema.safeParse('a.b-c_d').success).toBe(true);
      expect(PiTxidSchema.safeParse('a'.repeat(8)).success).toBe(true);
      expect(PiTxidSchema.safeParse('a'.repeat(7)).success).toBe(false);
    });
  });

  describe('canonical constants', () => {
    it('uses singular /api/payment/* gateway paths', () => {
      expect(PAYMENT_GATEWAY_PATHS.create).toBe('/api/payment/create');
      expect(PAYMENT_GATEWAY_PATHS.approve).toBe('/api/payment/approve');
      expect(PAYMENT_GATEWAY_PATHS.complete).toBe('/api/payment/complete');
    });
    it('internal header is x-internal-key (never x-service-secret)', () => {
      expect(INTERNAL_KEY_HEADER).toBe('x-internal-key');
    });
  });

  describe('buildCreatePaymentBody', () => {
    it('always forwards amount as a number', () => {
      const body = buildCreatePaymentBody(CreatePaymentRequestSchema.parse({ amount: '7.5' }));
      expect(body.amount).toBe(7.5);
      expect(typeof body.amount).toBe('number');
      expect(body.currency).toBe('PI');
      expect(body.payment_method).toBe('pi');
    });
    it('omits metadata when absent', () => {
      const body = buildCreatePaymentBody(CreatePaymentRequestSchema.parse({ amount: 1 }));
      expect('metadata' in body).toBe(false);
    });
  });
});
