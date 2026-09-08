/**
 * Shared Helper Utilities
 */

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

module.exports = {
  getPagination,
  chunkArray,
  sanitizeString,
};
