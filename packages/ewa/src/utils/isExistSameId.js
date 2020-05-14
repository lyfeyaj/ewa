
module.exports = function isExistSameId(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return !!arr.find(item => item.id === id);
  }
  return false;
}