"use strict";

module.exports = function removeById(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return arr.filter(function (item) {
      return item.id !== id;
    });
  }

  return arr;
};