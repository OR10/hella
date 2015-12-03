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
    };

    this.template = timerTemplate;
    this.scope = true;

    this.controller = TimerController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default TimerDirective;
