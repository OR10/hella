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
    if (item !== null && typeof item === 'object') {
      newArr[index] = iterateObject(item);
    } else if (item !== null && item.constructor !== undefined && item.constructor === [].constructor) {
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
    if (obj[key] !== null && typeof obj[key] === 'object') {
      sortedObj[key] = iterateObject(obj[key]);
    } else if (obj[key] !== null && obj[key].constructor !== undefined && obj[key].constructor === [].constructor) {
      sortedObj[key] = iterateArray(obj[key]);
    } else {
      sortedObj[key] = obj[key];
    }
  });

  return sortedObj;
}

