beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
    toMatchBelowThreshold: require('./Matchers/MatchBelowThreshold'),
    toContainNamedParamsRequest: require('./Matchers/ContainNamedParamsRequest'),
    toContainNamedParamsRequestOnce: require('./Matchers/ContainNamedParamsRequestOnce'),
    toContainRequest: require('./Matchers/ContainRequest'),
  });
});
