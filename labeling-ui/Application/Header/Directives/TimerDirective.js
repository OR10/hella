import timerTemplate from './TimerDirective.html!';
import TimerController from './TimerController';

/**
 * Directive to display the timer bar of the page
 */
class TimerDirective {
  constructor() {
    this.scope = {
      task: '=',
      user: '=',
      readOnly: '@',
    };

    this.template = timerTemplate;

    this.controller = TimerController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}

export default TimerDirective;
