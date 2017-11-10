import liveSyncIndicatorTemplate from './LiveSyncIndicatorDirective.html!';

/**
 * Directive to display sync progress
 */
class LiveSyncIndicatorDirective {
  /**
   * @param {LiveSyncIndicatorService} liveSyncIndicatorService
   * @param {$timeout} $timeout
   */
  constructor(liveSyncIndicatorService, $timeout) {
    /**
     * @type {LiveSyncIndicatorService}
     * @private
     */
    this._liveSyncIndicatorService = liveSyncIndicatorService;

    /**
     * @type {string}
     */
    this.template = liveSyncIndicatorTemplate;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;
  }

  link(scope) {
    scope.syncState = this._liveSyncIndicatorService.getIcon();
    scope.syncTooltip = this._liveSyncIndicatorService.getToolTip();

    this._liveSyncIndicatorService.on('syncstate:updated', (icon, toolTip) => {
      this._$timeout(() => {
        scope.syncState = icon;
        scope.syncTooltip = toolTip;
      });
    });
  }
}

LiveSyncIndicatorDirective.$inject = [
  'liveSyncIndicatorService',
  '$timeout',
];

export default LiveSyncIndicatorDirective;
