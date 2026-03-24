/**
 * Validates if an email meets the institutional requirements.
 * Rules:
 * - Must end in: @unifranz.edu.bo
 * - Must start with: scz.
 * - Expected format: scz.nombre.apellido.xx@unifranz.edu.bo
 */
export const isValidInstitutionalEmail = (email: string): boolean => {
  const lowercaseEmail = email.toLowerCase().trim();
  if (!lowercaseEmail.endsWith('@unifranz.edu.bo')) {
    return false;
  }
  if (!lowercaseEmail.startsWith('scz.') && !lowercaseEmail.startsWith('scze.')) {
    return false;
  }
  
  // Basic sanity check to ensure there's content between scz. and @unifranz.edu.bo
  const localPart = lowercaseEmail.split('@')[0];
  if (localPart.length <= 4) {
    return false; // only 'scz.'
  }

  return true;
};
