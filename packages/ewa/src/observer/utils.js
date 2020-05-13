function noop() {}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

// 判断数组中是否存在相同id的元素
function isExistSameId(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return !!arr.find(item => item.id === id);
  }
  return false;
}

// 根据id删除数组中元素
function removeById(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return arr.filter(item => item.id !== id);
  }
  return arr;
}

// 删除对象中空数组的属性
function removeEmptyArr(obj, key) {
  if (!obj || !Array.isArray(obj[key])) return;
  if (obj[key].length === 0) delete obj[key];
}

// 对象中是否存在某属性
function hasKeyByObj(obj, key) {
  if (!obj || !key) return false;
  if (key.indexOf('.') > -1) {
    return key.split('.')[0] in obj;
  } else {
    return key in obj;
  }
}

module.exports = {
  noop,
  isObject,
  isFunction,
  isExistSameId,
  removeById,
  removeEmptyArr,
  hasKeyByObj,
};