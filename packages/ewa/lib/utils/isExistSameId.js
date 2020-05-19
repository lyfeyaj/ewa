"use strict";

module.exports = function isExistSameId(arr, id) {
  if (Array.isArray(arr) && arr.length) {
    return !!arr.find(function (item) {
      return item.id === id;
    });
  }

  return false;
};