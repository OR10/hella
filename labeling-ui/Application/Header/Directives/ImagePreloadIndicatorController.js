class ImagePreloadIndicatorController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {ImagePreloader} imagePreloader
   */
  constructor($scope, imagePreloader) {
    /**
     * @type {ImagePreloader}
     * @private
     */
    this._preloader = imagePreloader;

    /**
     * @type {string}
     */
    this.tooltip = '';

    /**
     * @type {number}
     */
    this.percentageComplete = 100;

    /**
     * @type {boolean}
     */
    this.visible = false;

    /**
     * @type {{event, listener}}
     * @private
     */
    this._preloadEventListener = this._preloader.on('image:loaded', event => this._handleImageLoaded(event));

    // Do cleanup work if directive is no longer needed.
    $scope.$on('$destroy', () => this._handleDestroy());
  }

  /**
   * Handle the cleanup once the directive is destroyed
   * @private
   */
  _handleDestroy() {
    this._preloader.removeListener(this._preloadEventListener);
  }

  /**
   * Update information once another image is loaded
   *
   * @param event
   * @private
   */
  _handleImageLoaded(event) {
    this.percentageComplete = Math.round(
      (event.imageCountInChunkCompleted/event.imageCountInChunk) * 100
    );

    // Only visible if not all images are loaded yet.
    this.visible = (event.imageCountInChunkCompleted !== event.imageCountInChunk);
  }
}

ImagePreloadIndicatorController.$inject = [
  '$scope',
  'imagePreloader',
];

export default ImagePreloadIndicatorController;
