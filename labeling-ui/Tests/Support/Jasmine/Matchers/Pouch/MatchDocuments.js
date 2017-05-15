const namedParamsTest = new RegExp(/{{:[^}:]+}}/);

// Keys that cannot be tested for the hard value in a Pouch environment
const unstableKeys = [
  'rev',
  '_rev'
];

// Keys that are not stored in Pouch Documents
const omitKeys = [
  'ghost'
];

let lastMatch = {
  actual: null,
  expected: null,
  key: null,
};

function isUnstableKey(key) {
  return (unstableKeys.indexOf(key) > -1);
}

function isOmittedKey(key) {
  return (omitKeys.indexOf(key) > -1);
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

    if (isOmittedKey(key)) {
      continue;
    }

    let expectedValue = namedParamsRequestData[key];
    switch(key) {
      case 'id':
        actualValue = storedData['_id'];
        break;

      case 'startFrameNumber':
        actualValue = storedData['startFrameIndex'];
        break;

      case 'endFrameNumber':
        actualValue = storedData['endFrameIndex'];
        break;

      default:
        actualValue = storedData[key];
    }

    // For debugging purposes uncomment the following lines
    // console.log('=======');
    // console.log('Key: ', key);
    // console.log('Expected: ', expectedValue);
    // console.log('Actual: ', actualValue);

    if (i > 0) {
      lastMatch.expected = expectedValue;
      lastMatch.actual = actualValue;
      lastMatch.key = key;
    }

    if (typeof expectedValue === 'object' && expectedValue !== null && actualValue !== undefined) {
      result = matchDocuments(expectedValue, actualValue);
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