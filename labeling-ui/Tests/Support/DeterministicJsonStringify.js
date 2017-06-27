import {isArray, isObject} from 'lodash';

/**
 * JSON.stringify, which has a stable sorting of keys regardless of the objects definition order
 *
 * @param {object} obj
 * @returns {string}
 */
export function deterministicJsonStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return '';
  }

  return JSON.stringify(iterateObject(obj));
}

function iterateArray(arr) {
  let newArr = [];
  arr.forEach(function(item, index) {
    if (isObject(item)) {
      newArr[index] = iterateObject(item);
    } else if (isArray(item)) {
      newArr[index] = iterateArray(item);
    } else {
      newArr[index] = item;
    }
  });

  return newArr;
}

function iterateObject(obj) {
  let keys = Object.keys(obj);
  keys.sort();

  let sortedObj = {};
  keys.forEach(function(key) {
    if (isObject(obj[key])) {
      sortedObj[key] = iterateObject(obj[key]);
    } else if (isArray(obj[key])) {
      sortedObj[key] = iterateArray(obj[key]);
    } else {
      sortedObj[key] = obj[key];
    }
  });

  return sortedObj;
}

