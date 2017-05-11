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
    });
  } else {
    jasmine.addMatchers({
      toContainNamedParamsRequest: require('./Matchers/ContainNamedParamsRequest'),
      toContainNamedParamsRequestOnce: require('./Matchers/ContainNamedParamsRequestOnce'),
      toContainRequest: require('./Matchers/ContainRequest'),
    });
  }
});
