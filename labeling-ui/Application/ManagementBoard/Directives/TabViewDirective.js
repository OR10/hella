import tabViewTemplate from './TabViewDirective.html!';
import TabViewController from './TabViewController';

/**
 * Directive to display a TabView with multiple {@link TabDirective}s in it
 */
class TabViewDirective {
  constructor() {
    this.scope = {
      activeIndex: '@',
    };
    this.template = tabViewTemplate;
    this.controller = TabViewController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.transclude = true;
  }
}

export default TabViewDirective;
