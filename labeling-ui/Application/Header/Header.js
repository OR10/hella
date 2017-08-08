import Module from '../Module';
import TaskTitleDirective from './Directives/TaskTitleDirective';
import TimerDirective from './Directives/TimerDirective';
import BadgeDirective from './Directives/BadgeDirective';
import UserNameDirective from './Directives/UserNameDirective';
import LogoutButtonDirective from './Directives/LogoutButtonDirective';
import TimerGateway from './Gateways/TimerGateway';
import LiveSyncIndicatorDirective from './Directives/LiveSyncIndicatorDirective';
import LiveSyncIndicatorService from './Services/LiveSyncIndicatorService';
import ViewerTitleBarDirective from './Directives/ViewerTitleBarDirective';
import ImagePreloadIndicatorDirective from './Directives/ImagePreloadIndicatorDirective';

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
    this.module.service('timerGateway', TimerGateway);

    this.registerDirective('viewerTitleBar', ViewerTitleBarDirective);
    this.registerDirective('timer', TimerDirective);
    this.registerDirective('badge', BadgeDirective);
    this.registerDirective('taskTitle', TaskTitleDirective);
    this.registerDirective('userName', UserNameDirective);
    this.registerDirective('logoutButton', LogoutButtonDirective);
    this.registerDirective('liveSyncIndicator', LiveSyncIndicatorDirective);
    this.registerDirective('imagePreloadIndicator', ImagePreloadIndicatorDirective);
  }
}

export default Header;
