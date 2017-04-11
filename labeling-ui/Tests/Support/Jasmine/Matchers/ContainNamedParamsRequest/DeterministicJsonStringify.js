// JSON.stringify, which has a stable sorting of keys regardless of the objects definition order
module.exports = function deterministicJsonStringify(obj) {
  var iterateArray, iterateObject;

  iterateArray = function(arr) {
    var newArr = [];
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
  };

  iterateObject = function(obj) {
    var keys = Object.keys(obj);
    keys.sort();

    var sortedObj = {};
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
  };

  if (obj === null || typeof obj !== 'object') {
    return '';
  }

  return JSON.stringify(iterateObject(obj));
};