/** Provider boundaries. Implementations arrive with the feature that uses them. */
export interface EmailProvider {
  send(message: {
    to: string;
    subject: string;
    html: string;
    idempotencyKey: string;
  }): Promise<{ providerMessageId: string }>;
}

export interface MessagingProvider {
  sendApprovedTemplate(message: {
    toE164: string;
    templateId: string;
    variables: Record<string, string>;
    idempotencyKey: string;
  }): Promise<{ providerMessageId: string }>;
}

export interface PaymentProvider {
  createCheckout(input: {
    customerId: string;
    planId: string;
    returnUrl: string;
    idempotencyKey: string;
  }): Promise<{ checkoutUrl: string; providerReference: string }>;
  verifyWebhook(rawBody: Uint8Array, headers: Headers): Promise<{
    eventId: string;
    type: string;
    reference: string;
  }>;
}

export interface MediaProvider {
  createSignedUpload(input: {
    assetId: string;
    mimeType: string;
    rightsApproved: boolean;
  }): Promise<{ uploadUrl: string; providerAssetId: string }>;
}
