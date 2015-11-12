import {equals} from 'angular';

/**
 * @property {{classes: Array<string>}|null} labeledObject
 * @property {LabelStructure} structure
 * @property {Object} annotation
 * @property {int|undefined} limit
 * @property {int|undefined} offset
 */
class LabelWizardController {
  /**
   * @param {angular.$scope} $scope
   * @param {LinearLabelStructureVisitor} linearLabelStructureVisitor
   * @param {AnnotationLabelStructureVisitor} annotationStructureVisitor
   */
  constructor($scope, linearLabelStructureVisitor, annotationStructureVisitor) {
    /**
     * Pages displayed by the wizzard
     * @type {Array}
     */
    this.pages = [];

    /**
     * Choices clicked by the user
     *
     * @type {Object.<string, string>}
     */
    this.choices = {};

    /**
     * Object monitoring which pages are currently active
     *
     * @type {Object.<string, string>}
     */
    this.activePages = {};

    /**
     * @type {angular.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {LinearLabelStructureVisitor}
     * @private
     */
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    /**
     * @type {AnnotationLabelStructureVisitor}
     * @private
     */
    this._annotationStructureVisitor = annotationStructureVisitor;


    // Ensure an offset is always available
    if (!this.offset) {
      this.offset = 0;
    }

    // Update our Wizzard View if the classes list changes
    $scope.$watchCollection('vm.labeledObject.classes', (newClasses) => {
      if (newClasses) {
        this._updatePagesAndChoices();
      }
    });

    // Store and process choices made by the user
    $scope.$watch('vm.choices', () => {
      if (!this.labeledObject) {
        return;
      }

      const labels = Object.values(this.choices);
      if (equals(this.labeledObject.classes, labels)) {
        return;
      }

      this.labeledObject.classes = labels;

      // Store update here!
    }, true);

  //  $scope.$watchCollection('vm.labelState', (newState, oldState) => {
  //    if (oldState) {
  //      this.selectedStepIndex = this._findPreviousStepIndex(oldState) || 0;
  //    } else {
  //      this.selectedStepIndex = 0;
  //    }
  //
  //    if (this.limit) {
  //      this.steps = this.labelState.children.slice(this.offset, this.offset + this.limit);
  //    } else {
  //      this.steps = this.labelState.children;
  //    }
  //
  //    if (this.steps.length > this.selectedStepIndex) {
  //      this.steps[this.selectedStepIndex].active = true;
  //    }
  //  });
  }

  //_findPreviousStepIndex(state) {
  //  return state.children.reduce((foundIndex, step, index) => {
  //    if (foundIndex) {
  //      return foundIndex;
  //    }
  //
  //    return step.active ? index : null;
  //  }, null);
  //}

  /**
   * Generate a new linearized List using the `labeledObject` as well as `structure` and `annotation`
   * @returns {Array}
   * @private
   */
  _generateLinearList() {
    const labels = this.labeledObject.classes || [];
    const linearStructure = this._linearLabelStructureVisitor.visit(this.structure, labels);
    const annotatedStructure = this._annotationStructureVisitor.visit(linearStructure, this.annotation);
    const wizzardList = annotatedStructure.children;
    return wizzardList;
  }

  /**
   * Generate a valid set of pages to be rendered to the Wizzard View
   *
   * Pages depend on the `labelObject`, the `structure` as well as the `annotation`
   *
   * @private
   */
  _updatePagesAndChoices() {
    const list = this._generateLinearList();
    const newChoices = {};
    const newPages = [];
    const seenPages = {};

    list.forEach(node => {
      const id = node.name;
      const page = {id};
      seenPages[id] = true;
      newChoices[id] = node.metadata.value;
      newPages.push(page);

      page.challenge = node.metadata.challenge;
      page.responses = node.children.map(
        child => ({id: child.name, response: child.metadata.response})
      );
    });

    // Remove labels belonging to removed pages
    this.pages.forEach(page => {
      const id = page.id;
      if (seenPages[id] === true) {
        return;
      }
      if (this.choices[id] !== null) {
        // Remove the chosen value from the labelsObject
        this.labeledObject.classes = this.labeledObject.classes.filter(
          label => label !== this.choices[id]
        );
      }
    });

    this.pages = newPages;
    this.choices = newChoices;
  }
}

LabelWizardController.$inject = [
  '$scope',
  'linearLabelStructureVisitor',
  'annotationLabelStructureVisitor',
];

export default LabelWizardController;
