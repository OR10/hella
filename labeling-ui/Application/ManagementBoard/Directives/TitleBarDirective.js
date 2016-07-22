import titleBarTemplate from './TitleBarDirective.html!';
import TitleBarController from './TitleBarController';

/**
 * Directive to display the title bar of the page
 */
class TitleBarDirective {
  constructor() {
    this.scope = {
      user: '=',
      userPermissions: '=',
      backLink: '@?',
      backLinkText: '@?',
      showUsername: '@',
      showLogoutButton: '@',
    };

    this.transclude = true;

    this.template = titleBarTemplate;

    this.controller = TitleBarController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('showUsername', () => scope.vm.showUsername = attrs.showUsername === 'true');
    attrs.$observe('showLogoutButton', () => scope.vm.showLogoutButton = attrs.showLogoutButton === 'true');
    attrs.$observe('backLink', () => scope.vm.showBackButton = attrs.backLink ? true : false);
  }
}

export default TitleBarDirective;
