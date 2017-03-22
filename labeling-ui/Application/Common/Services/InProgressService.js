class InProgressService {
  /**
   * @param {$rootScope} $rootScope
   * @param {$window} $window
   * @param {ModalService} modalService
   */
  constructor($rootScope, $window, modalService) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @var {window}
     */
    this._$window = $window;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {function|null}
     * @private
     */
    this._uninstallNavigationInterceptor = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this._message = undefined;
  }

  _installNavigationInterceptor() {
    this._uninstallNavigationInterceptor = this._$rootScope.$on(
      '$stateChangeStart', event => {
        event.preventDefault();
        this._modalService.info(
          {
            title: 'Background process is running',
            headline: 'The page can not be left, while a background process is running.',
            message: this._message,
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            abortable: false,
            warning: true,
          }
        );
      }
    );
  }

  _windowBeforeUnload(event) {
    // The message is not shown in newer chrome versions, but a generic window will be shown.
    const message = `DO NOT LEAVE THIS PAGE!\n\nA background process is running. If you leave this page or close the browser window it will be stopped.\n\nPlease click 'Stay' now to continue the process.`;
    event.returnValue = message;

    return message;
  }

  start(message = undefined) {
    this._message = message;
    this._$window.addEventListener('beforeunload', this._windowBeforeUnload);
    this._installNavigationInterceptor();

    this._$rootScope.$on('$destroy', () => this._uninstallNavigationInterceptor());
  }

  end() {
    if (this._uninstallNavigationInterceptor !== null) {
      this._uninstallNavigationInterceptor();
      this._uninstallNavigationInterceptor = null;
    }

    this._$window.removeEventListener('beforeunload', this._windowBeforeUnload);
  }
}

InProgressService.$inject = [
  '$rootScope',
  '$window',
  'modalService',
];

export default InProgressService;
