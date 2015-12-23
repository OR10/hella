import {equals} from 'angular';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

/**
 * @property {string} labeledObjectType
 * @property {LabeledObject} labeledObject
 * @property {LabelStructure} structure
 * @property {Object} annotation
 * @property {Array<{header: string, offset: int?, limit: init?}>} sections
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {boolean} isCompleted
 */
export default class LabelSelectorController {
  /**
   * @param {angular.$scope} $scope
   * @param {LinearLabelStructureVisitor} linearLabelStructureVisitor
   * @param {AnnotationLabelStructureVisitor} annotationStructureVisitor
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {EntityIdService} entityIdService
   */
  constructor($scope, linearLabelStructureVisitor, annotationStructureVisitor, labeledFrameGateway, labeledThingInFrameGateway, entityIdService) {
    /**
     * Pages displayed by the wizzards
     * @type {Array|null}
     */
    this.pages = null;

    /**
     * Choices selected by the user inside the wizzards
     *
     * @type {Object.<string, string>}
     */
    this.choices = {};

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

    /**
     * @type {LabeledFrameGateway}
     * @private
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {Number|null}
     */
    this.activePageIndex = null;

    // Handle changes of `labeledObject`s
    $scope.$watch('vm.labeledObject', (newLabeledObject, oldLabeledObject) => {
      if (!newLabeledObject) {
        this.pages = null;
        this.activePageIndex = null;
        this.labelingInstructions = null;
        this.choices = {};
      } else {
        if (oldLabeledObject && oldLabeledObject.id !== newLabeledObject.id) {
          this.activePageIndex = null;
          this._updatePagesAndChoices();
        }
      }
    });

    // Update our Wizard View if the classes list changes
    $scope.$watchCollection('vm.labeledObject.classes', (newClasses) => {
      if (newClasses) {
        this._updatePagesAndChoices();
      }
    });

    // Store and process choices made by the user
    $scope.$watch('vm.choices', () => {
      this.isCompleted = this._isCompleted();

      if (!this.labeledObject) {
        return;
      }

      const labels = Object.values(this.choices).filter(
        choice => choice !== null
      );

      if (equals(this.labeledObject.classes, labels)) {
        return;
      }

      this.labeledObject.setClasses(labels);

      this._storeUpdatedLabeledObject();
    }, true);

    $scope.$watch('vm.activePageIndex', (newPageIndex) => {
      if (newPageIndex !== undefined && newPageIndex !== null) {
        this.labelingInstructions = this.pages[newPageIndex].instructions;
      }
    });
  }

  /**
   * Generate a new linearized List using the `labeledObject` as well as `structure` and `annotation`
   * @returns {Array}
   * @private
   */
  _generateLinearList() {
    const labels = this.labeledObject.classes || [];
    const linearStructure = this._linearLabelStructureVisitor.visit(this.structure, labels);
    const annotatedStructure = this._annotationStructureVisitor.visit(linearStructure, this.annotation);

    return annotatedStructure.children;
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
      page.instructions = node.metadata.instructions;
      page.responses = node.children.map(
        child => ({id: child.name, response: child.metadata.response, iconClass: child.metadata.iconClass})
      );
    });

    // Remove labels belonging to removed pages
    if (this.pages !== null) {
      this.pages.forEach(page => {
        const id = page.id;
        if (seenPages[id] === true) {
          return;
        }
        if (this.choices[id] !== null) {
          // Remove the chosen value from the labelsObject
          this.labeledObject.setClasses(
            this.labeledObject.classes.filter(
              label => label !== this.choices[id]
            )
          );
        }
      });
    }

    this.pages = newPages;
    this.choices = newChoices;

    if (this.activePageIndex === null && this.pages.length > 0) {
      this.activePageIndex = 0;
    }
  }

  /**
   * Send the updated labeledObject to the backend
   *
   * @private
   */
  _storeUpdatedLabeledObject() {
    switch (true) {
      case this.labeledObject instanceof LabeledThingInFrame:
        this._storeUpdatedLabeledThingInFrame(this.labeledObject);
        break;
      case this.labeledObject instanceof LabeledFrame:
        this._storeUpdatedLabeledFrame(this.labeledObject);
        break;
      default:
        throw new Error(`Unknown labeledObject type: Unable to send updates to the backend.`);
    }
  }

  /**
   * Store the updates to a LabeledThingInFrame to the backend
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _storeUpdatedLabeledThingInFrame(labeledThingInFrame) {
    labeledThingInFrame.incomplete = !this.isCompleted;

    this._labeledThingInFrameGateway.saveLabeledThingInFrame(
      labeledThingInFrame
    );
  }

  /**
   * Store the updates to a LabeledFrame to the backend
   *
   * @param {LabeledFrame} labeledFrame
   * @private
   */
  _storeUpdatedLabeledFrame(labeledFrame) {
    if (!labeledFrame.id) {
      labeledFrame.id = this._entityIdService.getUniqueId();
    }

    labeledFrame.incomplete = !this.isCompleted;

    this._labeledFrameGateway.saveLabeledFrame(
      this.task.id,
      this.framePosition.position,
      labeledFrame
    );
  }

  /**
   * Determine whether all the labels have been entered according to the structure
   *
   * @return {boolean}
   * @private
   */
  _isCompleted() {
    if (this.pages === null || this.pages.length === 0) {
      return false;
    }

    return this.pages.reduce(
      (isCompleted, page) => isCompleted === true && this.choices[page.id] !== null,
      true
    );
  }

  isPageActive(index) {
    return index === this.activePageIndex;
  }

  selectResponse(page, response) {
    this.choices[page.id] = response.id;
  }

  isResponseSelected(page, response) {
    return this.choices[page.id] === response.id;
  }

  selectPage(index) {
    this.activePageIndex = index;
  }

  nextPage() {
    this.activePageIndex = Math.min(this.activePageIndex + 1, this.pages.length - 1);
  }

  previousPage() {
    this.activePageIndex = Math.max(this.activePageIndex - 1, 0);
  }
}

LabelSelectorController.$inject = [
  '$scope',
  'linearLabelStructureVisitor',
  'annotationLabelStructureVisitor',
  'labeledFrameGateway',
  'labeledThingInFrameGateway',
  'entityIdService',
];
