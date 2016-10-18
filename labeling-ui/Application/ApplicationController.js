class LabelingController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$location} $location
   * @param {ModalService} modalService
   */
  constructor($scope, $location, modalService) {
    /**
     * @type {angular.Scope}
     * @private
     */
    this._$scope = $scope;

    this._$location = $location;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    this._$scope.$on('readOnlyError', () => {
      this._modalService.info(
        {
          title: 'Read only',
          headline: 'This task is read only',
          message: 'This task is marked as read only. This is either because of the tasks being marked as finished or because of the task being worked on by another person. You are not allowed to make any changes!',
          confirmButtonText: 'Reload page',
        },
        () => window.location.reload(),
        undefined,
        {
          abortable: false,
          warning: true,
        }
      );
    });

    this._$scope.$on('serverError', () => {
      this._modalService.info(
        {
          title: 'Error',
          headline: 'There was an error with the application!',
          message: 'Please reaload the page or go back to the main page.',
          confirmButtonText: 'Go to main page',
          cancelButtonText: 'Reload page',
        },
        () => this._$location.path('/'),
        () => window.location.reload(),
        {
          warning: true,
        }
      );
    });

    // this._$scope.$on('clientError', () => {
    //   this._modalService.info(
    //     {
    //       title: 'Error',
    //       headline: 'There was an error with the application!',
    //       message: 'Please reload the page or go back to the main page.',
    //       confirmButtonText: 'Go to main page',
    //       cancelButtonText: 'Reload page',
    //     },
    //     () => this._$location.path('/'),
    //     () => window.location.reload(),
    //     {
    //       warning: true,
    //     }
    //   );
    // });

    this._$scope.$on('revisionError', () => {
      this._modalService.info(
        {
          title: 'Error',
          headline: 'There was an error with the application!',
          message: 'Please reload the page and contact your label coordinator about this error.',
          confirmButtonText: 'Reload Page',
        },
        () => window.location.reload(),
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
    });
  }
}

LabelingController.$inject = [
  '$scope',
  '$location',
  'modalService',
];

export default LabelingController;
