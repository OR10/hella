const namedParamsTest = new RegExp(/{{:[^}:]+}}/);

export default function matchDocuments(namedParamsRequestData, storedData) {
  let result = true;

  let keys;
  if (namedParamsRequestData instanceof Array) {
    keys = namedParamsRequestData;
  } else {
    keys = Object.keys(namedParamsRequestData);
  }

  for (let i = 0; i < keys.length; i++) {
    let currentStoredValue;

    let key = keys[i];
    let currentValue = namedParamsRequestData[key];
    if (key === 'id') {
      currentStoredValue = storedData['_id'];
    } else {
      currentStoredValue = storedData[key];
    }

    if (typeof currentValue === 'object' && currentValue !== null) {
      result = matchDocuments(currentValue, storedData);
    } else if (typeof currentValue === 'string' && namedParamsTest.test(currentValue)) {
      result = currentValue.length > 0;
    } else {
      result = (currentValue === currentStoredValue);
    }

    if (!result) {
      return result;
    }
  }

  return result;
};