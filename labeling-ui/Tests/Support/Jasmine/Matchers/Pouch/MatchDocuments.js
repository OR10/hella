const namedParamsTest = new RegExp(/{{:[^}:]+}}/);

const unstableKeys = [
  'rev',
  '_rev'
];

let lastMatch = {
  actual: null,
  expected: null,
  key: null,
};

function isUnstableKey(key) {
  return (unstableKeys.indexOf(key) > -1);
}

export function matchDocuments(namedParamsRequestData, storedData) {
  let result = true;

  let keys;
  if (namedParamsRequestData instanceof Array) {
    keys = namedParamsRequestData;
  } else {
    keys = Object.keys(namedParamsRequestData);
  }

  for (let i = 0; i < keys.length; i++) {
    let actualValue;

    let key = keys[i];

    let expectedValue = namedParamsRequestData[key];
    if (key === 'id') {
      actualValue = storedData['_id'];
    } else {
      actualValue = storedData[key];
    }

    lastMatch.expected = expectedValue;
    lastMatch.actual = actualValue;
    lastMatch.key = key;

    if (typeof expectedValue === 'object' && expectedValue !== null) {
      result = matchDocuments(expectedValue, storedData);
    } else if (typeof expectedValue === 'string' && namedParamsTest.test(expectedValue)) {
      result = expectedValue.length > 0;
    } else if (isUnstableKey(key)) {
      result = expectedValue.length > 0;
    } else {
      result = (expectedValue === actualValue);
    }

    if (!result) {
      return result;
    }
  }

  return result;
};

export function lastMatchChecked() {
  return lastMatch;
}