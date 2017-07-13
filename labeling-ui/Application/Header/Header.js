import Module from '../Module';
import TaskTitleDirective from './Directives/TaskTitleDirective';
import TimerDirective from './Directives/TimerDirective';
import BadgeDirective from './Directives/BadgeDirective';
import UserNameDirective from './Directives/UserNameDirective';
import LogoutButtonDirective from './Directives/LogoutButtonDirective';
import PouchDbTimerGateway from './Gateways/PouchDbTimerGateway';
import LiveSyncIndicatorDirective from './Directives/LiveSyncIndicatorDirective';
import LiveSyncIndicatorService from './Services/LiveSyncIndicatorService';
import ViewerTitleBarDirective from './Directives/ViewerTitleBarDirective';

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

    this.module.service('liveSyncIndicatorService', LiveSyncIndicatorService);
    this.module.service('timerGateway', PouchDbTimerGateway);

    this.registerDirective('viewerTitleBar', ViewerTitleBarDirective);
    this.registerDirective('timer', TimerDirective);
    this.registerDirective('badge', BadgeDirective);
    this.registerDirective('taskTitle', TaskTitleDirective);
    this.registerDirective('userName', UserNameDirective);
    this.registerDirective('logoutButton', LogoutButtonDirective);
    this.registerDirective('liveSyncIndicator', LiveSyncIndicatorDirective);
  }
}

export default Header;
