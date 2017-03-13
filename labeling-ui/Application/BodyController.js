class BodyController {
  /**
   * @param {$scope} $scope
   * @param {$rootScope} $rootScope
   * @param {ApplicationLoadingMaskService} applicationLoadingMaskService
   * @param {ApplicationLoadingMaskStateService} applicationLoadingMaskStateService
   */
  constructor($scope, $rootScope, applicationLoadingMaskService, applicationLoadingMaskStateService) {
    /**
     * @type {ApplicationLoadingMaskService}
     * @private
     */
    this.applicationLoadingMaskService = applicationLoadingMaskService;

    /**
     * @type {boolean}
     */
    this.globalLoadingSpinner = false;

    /**
     * @type {string}
     */
    this.globalLoadingMessage = '';

    $scope.$watch('vm.applicationLoadingMaskService.showLoadingMask', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      this.globalLoadingMessage = this.applicationLoadingMaskService.message;
      this.globalLoadingSpinner = newValue;
    });

    $rootScope.$on('$stateChangeStart', (...args) => {
      applicationLoadingMaskStateService.stateChangeStart(...args);
    });

    $rootScope.$on('$stateChangeSuccess', (...args) => {
      applicationLoadingMaskStateService.stateChangeSuccess(...args);
    });

    $rootScope.$on('$stateChangeError', (...args) => {
      applicationLoadingMaskStateService.stateChangeError(...args);
    });
  }
}

BodyController.$inject = [
  '$scope',
  '$rootScope',
  'applicationLoadingMaskService',
  'applicationLoadingMaskStateService',
];

export default BodyController;
