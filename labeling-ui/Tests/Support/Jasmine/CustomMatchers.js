beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
    toMatchBelowThreshold: require('./Matchers/MatchBelowThreshold'),
    toContainNamedParamsRequest: require('./Matchers/Pouch/ContainNamedParamsRequest'),
    toContainNamedParamsRequestOnce: require('./Matchers/Pouch/ContainNamedParamsRequest'),
    toContainRequest: require('./Matchers/Pouch/ContainNamedParamsRequest'),
    toExistInPouchDb: require('./Matchers/Pouch/ExistInPouchDb'),
    toHaveMatchingTypeDocumentsInDb: require('./Matchers/Pouch/matchingTypeDocumentsInDb'),
  });
});
