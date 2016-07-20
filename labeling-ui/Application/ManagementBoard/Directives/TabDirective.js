import tabTemplate from './TabDirective.html!';
import TabController from './TabController';

/**
 * Directive to display a Tab inside a {@link TabViewDirective}
 */
class TabDirective {
  constructor() {
    this.scope = {
      title: '@',
      destroyWhenInactive: '@?',
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
    // Ensure destroyWhenInactive is properly evaluated
    attributes.$observe('destroyWhenInactive', () => {
      if (attributes.destroyWhenInactive === undefined) {
        $scope.destroyWhenInactive = false;
      } else {
        $scope.destroyWhenInactive = $scope.$eval(attributes.destroyWhenInactive);
      }
    });

    // Register with TabView
    const [tabController, tabViewController] = controllers;
    tabController._setTabViewController(tabViewController);
  }
}

export default TabDirective;
