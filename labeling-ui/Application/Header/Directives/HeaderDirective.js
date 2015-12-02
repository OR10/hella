import headerTemplate from './HeaderDirective.html!';
import HeaderController from './HeaderController';

/**
 * Directive to display the header bar of the page
 */
class HeaderDirective {
  constructor() {
    this.template = headerTemplate;
    this.scope = true;

    this.controller = HeaderController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default HeaderDirective;
