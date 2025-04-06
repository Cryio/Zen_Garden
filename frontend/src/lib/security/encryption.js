import CryptoJS from 'crypto-js';

// Check if required environment variables are set
if (!import.meta.env.VITE_ENCRYPTION_KEY) {
  throw new Error('VITE_ENCRYPTION_KEY is not set in environment variables');
}

/**
 * Encrypts sensitive data using AES encryption
 * @param {Object} data - The data to encrypt
 * @returns {string} - The encrypted data string
 */
export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      import.meta.env.VITE_ENCRYPTION_KEY
    ).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Separates sensitive and non-sensitive data and encrypts sensitive data
 * @param {Object} formData - The complete form data
 * @returns {Object} - Object containing non-sensitive data and encrypted sensitive data
 */
export const prepareSecureData = (formData) => {
  // Separate sensitive and non-sensitive data
  const sensitiveData = {
    email: formData.email,
    password: formData.password,
    dob: formData.dob
  };

  const nonSensitiveData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    gender: formData.gender
  };

  // Encrypt sensitive data
  const encryptedData = encryptData(sensitiveData);

  // Return combined payload
  return {
    ...nonSensitiveData,
    encryptedData
  };
};

/**
 * Clears sensitive data from memory
 * @param {Object} sensitiveData - Object containing sensitive data
 */
export const clearSensitiveData = (sensitiveData) => {
  Object.keys(sensitiveData).forEach(key => {
    sensitiveData[key] = null;
  });
}; 