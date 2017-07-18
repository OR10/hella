const originalIt = window.it;
const originalFit = window.fit;
const originalXit = window.xit;

function installItOverride(it, fit, xit) {
  window.it = it;
  window.fit = fit;
  window.xit = xit;
}

function removeOverride() {
  window.it = originalIt;
  window.fit = originalFit;
  window.xit = originalXit;
}

window.using = (dataset, testDefinitionFn) => {
  dataset.forEach((args, index) => {
    const suffix = ` (with dataset ${index})`;

    function overrideIt(description, fn) {
      originalIt(`${description}${suffix}`, fn);
    }

    function overrideFit(description, fn) {
      originalFit(`${description}${suffix}`, fn);
    }

    function overrideXit(description, fn) {
      originalXit(`${description}${suffix}`, fn);
    }

    installItOverride(overrideIt, overrideFit, overrideXit);
    testDefinitionFn(...args);
    removeOverride();
  });
};
