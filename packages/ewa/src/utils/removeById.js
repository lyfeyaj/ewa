
module.exports = function removeById(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return arr.filter(item => item.id !== id);
  }
  return arr;
}
