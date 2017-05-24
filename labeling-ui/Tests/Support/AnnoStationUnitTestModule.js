import angular from 'angular';

// For some reason (probably import race conditions) importing the Module in here does not work but would only
// throw the following error:
// Uncaught TypeError: Super expression must either be null or a function, not undefined
// See https://github.com/styled-components/styled-components/issues/271#issuecomment-263773570
export default function(Module) {
  return class AnnoStationUnitTestModule extends Module {
    constructor(moduleName = 'AnnoStation-Unit') {
      super();
      this.module = angular.module(moduleName, []);
    }

    registerFilter(name, filter) {
      this.module.filter(name, filter);
    }

    registerService(name, service) {
      this.module.service(name, service);
    }
  }
}