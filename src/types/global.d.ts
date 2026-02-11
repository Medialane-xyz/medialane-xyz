export { };

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      walletCreated?: boolean;
      publicKey?: string;
      encryptedPrivateKey?: string;
    };
    firstName?: string;
  }
}