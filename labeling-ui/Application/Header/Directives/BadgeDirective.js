import badgeTemplate from './BadgeDirective.html!';
import BadgeController from './BadgeController';

/**
 * Directive to display the title bar of the page
 */
class BadgeDirective {
  constructor() {
    this.scope = {
      label: '=',
    };

    this.transclude = true;

    this.template = badgeTemplate;

    this.controller = BadgeController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default BadgeDirective;
