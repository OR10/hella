import Module from '../Module';
import HeaderDirective from './Directives/HeaderDirective';
import TimerDirective from './Directives/TimerDirective';
import TimerGateway from './Gateways/TimerGateway';

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

    this.module.service('timerGateway', TimerGateway);
  }
}

export default Header;
