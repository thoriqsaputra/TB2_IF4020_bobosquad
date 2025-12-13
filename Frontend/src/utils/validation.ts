import { CONFIG } from '../config/config';

export const validateFile = (file?: File) => {
  if (!file) return 'File is required';
  if (!CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)) {
    return 'Unsupported file type';
  }
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    return 'File is too large (max 5MB)';
  }
  return '';
};

export const isIssuer = (address?: string) => {
  if (!address) return false;
  return address.toLowerCase() === CONFIG.ISSUER_ADDRESS.toLowerCase();
};
