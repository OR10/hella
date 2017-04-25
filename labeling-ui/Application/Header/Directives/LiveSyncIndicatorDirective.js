import liveSyncIndicatorTemplate from './LiveSyncIndicatorDirective.html!';

/**
 * Directive to display sync progress
 */
class LiveSyncIndicatorDirective {
  /**
   * @param {LiveSyncIndicatorService} liveSyncIndicatorService
   */
  constructor(liveSyncIndicatorService) {
    /**
     * @type {LiveSyncIndicatorService}
     * @private
     */
    this._liveSyncIndicatorService = liveSyncIndicatorService;

    /**
     * @type {string}
     */
    this.template = liveSyncIndicatorTemplate;
  }

  link(scope) {
    scope.syncState = this._liveSyncIndicatorService.getIcon();
    scope.syncTooltip = this._liveSyncIndicatorService.getToolTip();

    this._liveSyncIndicatorService.on('syncstate:updated', (icon, toolTip) => {
      scope.syncState = icon;
      scope.syncTooltip = toolTip;
    });
    this._liveSyncIndicatorService.on('syncstate:updated', (icon, toolTip) => {
      scope.syncState = icon;
      scope.syncTooltip = toolTip;
    });
    this._liveSyncIndicatorService.on('syncstate:updated', (icon, toolTip) => {
      scope.syncState = icon;
      scope.syncTooltip = toolTip;
    });
  }
}

LiveSyncIndicatorDirective.$inject = [
  'liveSyncIndicatorService',
];

export default LiveSyncIndicatorDirective;
