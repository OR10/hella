beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
    toMatchBelowThreshold: require('./Matchers/MatchBelowThreshold'),
    toContainNamedParamsRequest: require('./Matchers/ContainNamedParamsRequest'),
  });
});
