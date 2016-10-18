class LabelingController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$location} $location
   */
  constructor($scope, $location) {
    /**
     * @type {angular.Scope}
     * @private
     */
    this._$scope = $scope;

    this._$location = $location;
  }
}

LabelingController.$inject = [
  '$scope',
  '$location',
];

export default LabelingController;
