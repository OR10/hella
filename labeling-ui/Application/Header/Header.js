import Module from '../Module';
import HeaderDirective from './Directives/HeaderDirective';
import TimerDirective from './Directives/TimerDirective';

/**
 * Module containing all functionality related to the header bar
 *
 * @extends Module
 */
class Header extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Header', []);

    this.registerDirective('header', HeaderDirective);
    this.registerDirective('timer', TimerDirective);
  }
}

export default Header;
