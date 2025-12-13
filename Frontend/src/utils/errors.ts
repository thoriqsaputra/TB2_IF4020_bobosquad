export enum ErrorCode {
  WALLET_NOT_CONNECTED = 'E001',
  INVALID_SIGNATURE = 'E002',
  WRONG_NETWORK = 'E003',
  CONTRACT_ERROR = 'E101',
  UNAUTHORIZED = 'E102',
  CERTIFICATE_NOT_FOUND = 'E103',
  ALREADY_REVOKED = 'E104',
  ENCRYPTION_FAILED = 'E201',
  DECRYPTION_FAILED = 'E202',
  HASH_MISMATCH = 'E203',
  UPLOAD_FAILED = 'E204',
  DOWNLOAD_FAILED = 'E205',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
