var features = require('../../../Application/features.json');

beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
    toMatchBelowThreshold: require('./Matchers/MatchBelowThreshold'),
  });

  if (features.pouchdb) {
    jasmine.addMatchers({
      toContainNamedParamsRequest: require('./Matchers/Pouch/ContainNamedParamsRequest'),
      toContainNamedParamsRequestOnce: require('./Matchers/Pouch/ContainNamedParamsRequest'),
      toContainRequest: require('./Matchers/Pouch/ContainNamedParamsRequest'),
      toExistInPouchDb: require('./Matchers/Pouch/ExistInPouchDb'),
      toHaveMatchingTypeDocumentsInDb: require('./Matchers/Pouch/matchingTypeDocumentsInDb'),
    });
  } else {
    jasmine.addMatchers({
      toContainNamedParamsRequest: require('./Matchers/ContainNamedParamsRequest'),
      toContainNamedParamsRequestOnce: require('./Matchers/ContainNamedParamsRequestOnce'),
      toContainRequest: require('./Matchers/ContainRequest'),
    });
  }
});
