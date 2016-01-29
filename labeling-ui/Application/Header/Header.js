import Module from '../Module';
import ViewerTitleBarDirective from './Directives/ViewerTitleBarDirective';
import TaskTitleDirective from './Directives/TaskTitleDirective';
import TimerDirective from './Directives/TimerDirective';
import UserNameDirective from './Directives/UserNameDirective';
import LogoutButtonDirective from './Directives/LogoutButtonDirective';
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

    this.registerDirective('viewerTitleBar', ViewerTitleBarDirective);
    this.registerDirective('timer', TimerDirective);
    this.registerDirective('taskTitle', TaskTitleDirective);
    this.registerDirective('userName', UserNameDirective);
    this.registerDirective('logoutButton', LogoutButtonDirective);

    this.module.service('timerGateway', TimerGateway);
  }
}

export default Header;
