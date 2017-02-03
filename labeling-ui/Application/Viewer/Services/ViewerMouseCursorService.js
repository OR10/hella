import EventEmitter from 'event-emitter';

class ViewerMouseCursorService extends EventEmitter {
  /**
   * @param {$scope} $scope
   */
  constructor($scope) {
    super();
    /**
     * @type {$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {string}
     * @private
     */
    this._defaultCursor = 'default';

    /**
     * @type {string|null}
     * @private
     */
    this._cursor = null;

    /**
     * @type {boolean}
     * @private
     */
    this._crosshair = false;
  }

  /**
   * @return {string}
   */
  getMouseCursor() {
    if (this._cursor === null) {
      return this._defaultCursor;
    }

    return this._cursor;
  }

  /**
   * @param {string} cursor
   */
  setMouseCursor(cursor) {
    this._cursor = cursor;
    this._$scope.$applyAsync(() => {
      this.emit('cursor:updated', this.getMouseCursor());
    });
  }

  /**
   * @param {string} defaultCursor
   */
  setDefaultMouseCursor(defaultCursor) {
    this._defaultCursor = defaultCursor;
    this._$scope.$applyAsync(() => {
      this.emit('cursor:updated', this.getMouseCursor());
    });
  }

  showCrosshair() {
    this._crosshair = true;
    this._$scope.$applyAsync(() => {
      this.emit('crosshair:updated', this._crosshair);
    });
  }

  hideCrosshair() {
    this._crosshair = false;
    this._$scope.$applyAsync(() => {
      this.emit('crosshair:updated', this._crosshair);
    });
  }

  /**
   * @return {boolean}
   */
  isCrosshairShowing() {
    return this._crosshair;
  }

}

ViewerMouseCursorService.$inject = ['$rootScope'];

export default ViewerMouseCursorService;
