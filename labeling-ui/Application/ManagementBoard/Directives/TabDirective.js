import tabTemplate from './TabDirective.html!';
import TabController from './TabController';

/**
 * Directive to display a Tab inside a {@link TabViewDirective}
 */
class TabDirective {
  constructor() {
    this.scope = {
      header: '@',
      destroyWhenInactive: '@?',
      createOnFirstView: '@?',
      onActivate: '&?',
      onDeactivate: '&?',
      show: '=?',
    };
    this.template = tabTemplate;
    this.controller = TabController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.transclude = true;
    this.require = [
      'tab',
      '^tabView',
    ];
  }

  link($scope, element, attributes, controllers) {
    // Ensure booleans are properly evaluated
    ['destroyWhenInactive', 'createOnFirstView'].forEach(
      attributeName => attributes.$observe(attributeName, () => {
        if (attributes[attributeName] === undefined) {
          $scope[attributeName] = false;
        } else {
          $scope[attributeName] = $scope.$eval(attributes[attributeName]);
        }
      })
    );

    // Register with TabView
    const [tabController, tabViewController] = controllers;
    tabController._setTabViewController(tabViewController);
  }
}

export default TabDirective;
