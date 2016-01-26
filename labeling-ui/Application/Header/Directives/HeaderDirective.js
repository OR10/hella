import headerTemplate from './HeaderDirective.html!';
import HeaderController from './HeaderController';

/**
 * Directive to display the header bar of the page
 */
class HeaderDirective {
  constructor() {
    this.scope = {
      user: '=',
      backLink: '@?',
      backLinkText: '@?',
      showUsername: '@?',
      showLogoutButton: '@?',
    };

    this.transclude = true;

    this.template = headerTemplate;

    this.controller = HeaderController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default HeaderDirective;
