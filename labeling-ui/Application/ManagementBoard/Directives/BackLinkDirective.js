import backLinkTemplate from './BackLinkDirective.html!';
import BackLinkController from './BackLinkController';

/**
 * Directive to display a back link on the page
 */
class BackLinkDirective {
  constructor() {
    this.scope = {
      stateLink: '@?',
      tooltip: '@?',
    };

    this.template = backLinkTemplate;
    this.controller = BackLinkController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default BackLinkDirective;
