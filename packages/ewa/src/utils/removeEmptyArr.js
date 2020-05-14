
module.exports = function removeEmptyArr(obj, key) {
  if (!obj || !Array.isArray(obj[key])) return;
  if (obj[key].length === 0) delete obj[key];
}