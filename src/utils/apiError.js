/**
 * Extracts the most specific human-readable error message from an Axios error.
 *
 * API envelope shape:
 *   { success: false, errors: { field: ["msg", ...], ... }, message: "Validation error." }
 *
 * Priority:
 *   1. First string inside errors.<anyField>[0]
 *   2. data.message
 *   3. data.detail
 *   4. fallback
 */
const getApiError = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (!data) return fallback;

  const { errors, message, detail } = data;

  if (errors && typeof errors === 'object') {
    const firstField = Object.values(errors).find(v => Array.isArray(v) && v.length);
    if (firstField) return firstField[0];
  }

  return message || detail || fallback;
};

export default getApiError;
