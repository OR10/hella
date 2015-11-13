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

    // Handle slices, which appear before the current selection
    $scope.$watchCollection('vm.slicedPages', (newSlices, oldSlices) => {
      for (let i = 0; i < newSlices.length; i++) {
        const newSlice = newSlices[i];
        if (this.activePages[newSlice.id] === true) {
          // Found active page without a difference before it
          break;
        }

        if (!oldSlices[i] || newSlice.id !== oldSlices[i].id) {
          // A difference has been detected
          // Move activePages
          this.activePages = {[newSlice.id]: true};
          break;
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
