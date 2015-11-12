/**
 * @property {Object} pages
 * @property {Object} choices
 * @property {int|undefined} limit
 * @property {int|undefined} offset
 */
class LabelWizardController {
  /**
   * @param {angular.$scope} $scope
   */
  constructor($scope) {
    /**
     * Object monitoring which pages are currently active
     *
     * @type {Object.<string, string>}
     */
    this.activePages = {};

    /**
     * Sliced part of pages displayed by this wizzard
     *
     * @type {Array}
     */
    this.slicedPages = [];

    // Update the used slice of pages once the full list is updated
    $scope.$watchCollection('vm.pages', newPages => {
      if (newPages === null) {
        this.activePages = {};
        this.slicedPages = [];
      } else {
        if (this.limit) {
          this.slicedPages = newPages.slice(this.offset, this.offset + this.limit);
        } else {
          this.slicedPages = newPages.slice(this.offset);
        }
      }
    });

    /**
     * @type {angular.$scope}
     * @private
     */
    this._$scope = $scope;

    // Ensure an offset is always available
    if (!this.offset) {
      this.offset = 0;
    }
  }
}

LabelWizardController.$inject = [
  '$scope',
];

export default LabelWizardController;
