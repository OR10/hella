const namedParamsTest = new RegExp(/{{:[^}:]+}}/);

// Keys that cannot be tested for the hard value in a Pouch environment
const unstableKeys = [
  'rev',
  '_rev',
];

// Keys that are not stored in Pouch Documents
const omitKeys = [
  'ghost',
  'ghostClasses',
];

const lastMatch = {
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

function isFloatingPoint(value) {
  return Number(value) === value && value % 1 !== 0;
}

function matchFloatingPoint(expectedValue, actualValue, precision = 10) {
  lastMatch.expected = Number(expectedValue.toPrecision(precision));
  lastMatch.actual = Number(actualValue.toPrecision(precision));
  return Math.abs(expectedValue - actualValue) < (Math.pow(10, -precision) / 2);
}

export function matchDocuments(namedParamsRequestData, storedData, upperLevel = true) {
  let result = true;
  const keys = Object.keys(namedParamsRequestData);

  for (let index = 0; index < keys.length; index++) {
    let actualValue;

    const key = keys[index];

    if (isOmittedKey(key)) {
      continue;
    }

    const expectedValue = namedParamsRequestData[key];
    switch (key) {
      case 'id':
        if (upperLevel) {
          actualValue = storedData['_id'];
        } else {
          actualValue = storedData[key];
        }
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

    if (index > 0) {
      lastMatch.expected = expectedValue;
      lastMatch.actual = actualValue;
      lastMatch.key = key;
    }

    if (typeof expectedValue === 'object' && expectedValue !== null && actualValue !== undefined) {
      result = matchDocuments(expectedValue, actualValue, false);
    } else if (typeof expectedValue === 'string' && namedParamsTest.test(expectedValue)) {
      result = expectedValue.length > 0;
    } else if (isUnstableKey(key)) {
      result = expectedValue.length > 0;
    } else if (isFloatingPoint(expectedValue)) {
      result = matchFloatingPoint(expectedValue, actualValue);
    } else {
      result = (expectedValue === actualValue);
    }

    if (!result) {
      return result;
    }
  }
  return result;
}

export function lastMatchChecked() {
  return lastMatch;
}
