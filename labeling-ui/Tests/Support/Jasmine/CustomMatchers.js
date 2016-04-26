beforeEach(function() {
  jasmine.addMatchers({
    toEqualDrawingStack: require('./Matchers/EqualDrawingStack'),
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
  });
});
