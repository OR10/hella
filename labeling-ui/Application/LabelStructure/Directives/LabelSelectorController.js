import {equals} from 'angular';

var _entityIdService:EntityIdService;
/**
 * @class LabelSelectorController
 *
 * @property {string} labeledObjectType
 * @property {{classes: Array<string>}} labeledObject
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
     * Storage for open panels state
     *
     * @type {Array}
     */
    this.openPanels = [true];

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

    // Handle changes of `labeledObject`s
    $scope.$watch('vm.labeledObject', newLabeledObject => {
      if (newLabeledObject === null) {
        this.pages = null;
        this.choices = {};
      }

      this.openPanels = [true];
    });

    // Update our Wizzard View if the classes list changes
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

      this.labeledObject.classes = labels;

      this._storeUpdatedLabeledObject();
    }, true);
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
    if (this.pages !== null) {
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
    }

    this.pages = newPages;
    this.choices = newChoices;
  }

  /**
   * Send the updated labeledObject to the backend
   *
   * @private
   */
  _storeUpdatedLabeledObject() {
    // @TODO: Use instanceof checks o.ä. mit klassenhierachie hier.
    //        alternatively implement the corresponding function on the type
    //        maybe going back and forth?
    switch (this.labeledObjectType) {
      case 'labeledThingInFrame':
        this._storeUpdatedLabeledThingInFrame(this.labeledObject);
      break;
      case 'labeledFrame':
        this._storeUpdatedLabeledFrame(this.labeledObject);
      break;
      default:
        throw new Error(`Unknown labeledObjectType (${this.labeledObjectType}): Unable to send updates to the backend.`);
    }
  }

  /**
   * Store the updates to a LabeledThingInFrame to the backend
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _storeUpdatedLabeledThingInFrame(labeledThingInFrame) {
    labeledThingInFrame.incomplete = (!this.isCompleted || labeledThingInFrame.shapes.length === 0);

    this._labeledThingInFrameGateway.updateLabeledThingInFrame(
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
}

LabelSelectorController.$inject = [
  '$scope',
  'linearLabelStructureVisitor',
  'annotationLabelStructureVisitor',
  'labeledFrameGateway',
  'labeledThingInFrameGateway',
  'entityIdService',
];
