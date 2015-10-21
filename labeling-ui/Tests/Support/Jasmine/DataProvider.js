((global) => {
  const originalIt = global.it;
  const originalFit = global.fit;
  const originalXit = global.xit;

  function installItOverride(it, fit, xit) {
    global.it = it;
    global.fit = fit;
    global.xit = xit;
  }

  function removeOverride() {
    global.it = originalIt;
    global.fit = originalFit;
    global.xit = originalXit;
  }

  global.using = (dataset, testDefinitionFn) => {
    dataset.forEach(args => {
      const suffix = `(with ${args.join(', ')})`;

      function overrideIt(description, fn) {
        originalIt(`${description} ${suffix}`, fn);
      }
      function overrideFit(description, fn) {
        originalFit(`${description} ${suffix}`, fn);
      }
      function overrideXit(description, fn) {
        originalXit(`${description} ${suffix}`, fn);
      }

      installItOverride(overrideIt, overrideFit, overrideXit);
      testDefinitionFn(...args);
      removeOverride();
    });
  };
})(this);
