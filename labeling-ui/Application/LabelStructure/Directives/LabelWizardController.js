/**
 * @class LabelWizardController
 */
export default class LabelWizardController {
  constructor($scope) {
    if (!this.offset) {
      this.offset = 0;
    }

    $scope.$watchCollection('vm.labelState', (newState, oldState) => {
      if (oldState) {
        this.selectedStepIndex = this._findPreviousStepIndex(oldState) || 0;
      } else {
        this.selectedStepIndex = 0;
      }

      if (this.limit) {
        this.steps = this.labelState.children.slice(this.offset, this.offset + this.limit);
      } else {
        this.steps = this.labelState.children;
      }

      if (this.steps.length > this.selectedStepIndex) {
        this.steps[this.selectedStepIndex].active = true;
      }
    });
  }

  _findPreviousStepIndex(state) {
    return state.children.reduce((foundIndex, step, index) => {
      if (foundIndex) {
        return foundIndex;
      }

      return step.active ? index : null;
    }, null);
  }
}

LabelWizardController.$inject = [
  '$scope',
];
