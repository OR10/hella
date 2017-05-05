var features = require('../../../Application/features.json');

beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
    toMatchBelowThreshold: require('./Matchers/MatchBelowThreshold'),
    toContainNamedParamsRequestOnce: require('./Matchers/ContainNamedParamsRequestOnce'),
    toContainRequest: require('./Matchers/ContainRequest'),
  });

  if (features.pouchdb) {
    jasmine.addMatchers({
      toContainNamedParamsRequest: require('./Matchers/Pouch/ContainNamedParamsRequest'),
    });
  } else {
    jasmine.addMatchers({
      toContainNamedParamsRequest: require('./Matchers/ContainNamedParamsRequest'),
    });
  }
});
