beforeEach(function() {
  jasmine.addMatchers({
    toEqualRenderedDrawingStack: require('./Matchers/EqualRenderedDrawingStack'),
  });
});
