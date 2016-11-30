// the following functions are from https://github.com/michaelbromley/angular-es6/blob/master/src/app/utils/register.js

/*eslint-disable */

/**
 * If the constructorFn is an array of type ['dep1', 'dep2', ..., constructor() {}]
 * we need to pull out the array of dependencies and add it as an $inject property of the
 * actual constructor function.
 * @param input
 * @returns {*}
 * @private
 */
function _normalizeConstructor(input) {
  var constructorFn;

  if (input.constructor === Array) {
    var injected = input.slice(0, input.length - 1);
    constructorFn = input[input.length - 1];
    constructorFn.$inject = injected;
  } else {
    constructorFn = input;
  }

  return constructorFn;
}

/**
 * Clone a function
 * @param original
 * @returns {Function}
 * @private
 */
function _cloneFunction(original) {
  return function() {
    return original.apply(this, arguments);
  };
}

/**
 * Convert a constructor function into a factory function which returns a new instance of that
 * constructor, with the correct dependencies automatically injected as arguments.
 *
 * In order to inject the dependencies, they must be attached to the constructor function with the
 * `$inject` property annotation.
 *
 * @param constructorFn
 * @returns {Array.<T>}
 * @private
 */
function _createFactoryArray(constructorFn) {
  // get the array of dependencies that are needed by this component (as contained in the `$inject` array)
  var args = constructorFn.$inject || [];
  var factoryArray = args.slice(); // create a copy of the array
  // The factoryArray uses Angular's array notation whereby each element of the array is the name of a
  // dependency, and the final item is the factory function itself.
  factoryArray.push((...args) => {
    //return new constructorFn(...args);
    var instance = new constructorFn(...args);
    for (var key in instance) {
      instance[key] = instance[key];
    }
    return instance;
  });

  return factoryArray;
}

/**
 * Override an object's method with a new one specified by `callback`.
 * @param object
 * @param methodName
 * @param callback
 * @private
 */
function _override(object, methodName, callback) {
  object[methodName] = callback(object[methodName])
}

/*eslint-enable */

class Module {
  /**
   * Configure a module using angular.config
   */
  config() {
  }

  /**
   * Registers this module and all its components against angular.
   *
   * This is where all your components (modules, directives, controllers, services, etc.) should be set up.
   *
   * @param {angular} angular
   * @param {object} featureFlags
   */
  registerWithAngular(angular, featureFlags) { // eslint-disable-line no-unused-vars
  }

  /**
   * Register a directive for this module
   *
   * Registering directives can not be done "the angular way", but should
   * use this wrapper. ES6-Classes as angular directives are not really
   * supported, this is what we're trying to work around here.
   *
   * This code is MIT licensed and was only modified slightly. See below for the original source.
   *
   * @link https://github.com/michaelbromley/angular-es6/blob/master/src/app/utils/register.js
   * @link http://www.michaelbromley.co.uk/blog/350/exploring-es6-classes-in-angularjs-1-x
   *
   * @param {string} name
   * @param {function} constructorFn
   */
  registerDirective(name, constructorFn) {
    const normalizedConstructorFn = _normalizeConstructor(constructorFn);

    if (!normalizedConstructorFn.prototype.compile) {
      // create an empty compile function if none was defined.
      normalizedConstructorFn.prototype.compile = () => {
      };
    }

    const originalCompileFn = _cloneFunction(normalizedConstructorFn.prototype.compile);

    // Decorate the compile method to automatically return the link method (if it exists)
    // and bind it to the context of the constructor (so `this` works correctly).
    // This gets around the problem of a non-lexical "this" which occurs when the directive class itself
    // returns `this.link` from within the compile function.
    _override(normalizedConstructorFn.prototype, 'compile', function compile() {
      return function compiled() {
        originalCompileFn.apply(this, arguments);

        if (normalizedConstructorFn.prototype.link) {
          return normalizedConstructorFn.prototype.link.bind(this);
        }
      };
    });

    const factoryArray = _createFactoryArray(normalizedConstructorFn);
    this.module.directive(name, factoryArray);
  }
}

export default Module;
