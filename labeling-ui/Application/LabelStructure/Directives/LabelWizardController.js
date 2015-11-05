/**
 * @class LabelWizardController
 */
export default class LabelWizardController {
  constructor($scope) {
    if (!this.offset) {
      this.offset = 0;
    }

    $scope.$watchCollection('vm.labelState', () => {
      if (this.limit) {
        this.steps = this.labelState.children.slice(this.offset, this.offset + this.limit);
      } else {
        this.steps = this.labelState.children;
      }
    });
  }
}

LabelWizardController.$inject = [
  '$scope',
];
