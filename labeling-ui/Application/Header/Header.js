import Module from '../Module';
import ViewerTitleBarDirective from './Directives/ViewerTitleBarDirective';
import PouchDbViewerTitleBarDirective from './Directives/PouchDbViewerTitleBarDirective';
import TaskTitleDirective from './Directives/TaskTitleDirective';
import TimerDirective from './Directives/TimerDirective';
import BadgeDirective from './Directives/BadgeDirective';
import UserNameDirective from './Directives/UserNameDirective';
import LogoutButtonDirective from './Directives/LogoutButtonDirective';
import TimerGateway from './Gateways/TimerGateway';
import PouchDbTimerGateway from './Gateways/PouchDbTimerGateway';
import LiveSyncIndicatorDirective from './Directives/LiveSyncIndicatorDirective';

import LiveSyncIndicatorService from './Services/LiveSyncIndicatorService';

/**
 * Module containing all functionality related to the header bar
 *
 * @extends Module
 */
class Header extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular, featureFlags) {
    this.module = angular.module('AnnoStation.Header', []);

    this.module.service('liveSyncIndicatorService', LiveSyncIndicatorService);

    if (featureFlags.pouchdb === true) {
      this.module.service('timerGateway', PouchDbTimerGateway);
      this.registerDirective('viewerTitleBar', PouchDbViewerTitleBarDirective);
    } else {
      this.registerDirective('viewerTitleBar', ViewerTitleBarDirective);
      this.module.service('timerGateway', TimerGateway);
    }

    this.registerDirective('timer', TimerDirective);
    this.registerDirective('badge', BadgeDirective);
    this.registerDirective('taskTitle', TaskTitleDirective);
    this.registerDirective('userName', UserNameDirective);
    this.registerDirective('logoutButton', LogoutButtonDirective);
    this.registerDirective('liveSyncIndicator', LiveSyncIndicatorDirective);
  }
}

export default Header;
