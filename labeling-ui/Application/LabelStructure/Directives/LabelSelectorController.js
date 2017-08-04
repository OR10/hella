import {equals} from 'angular';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

import PaperThingShape from 'Application/Viewer/Shapes/PaperThingShape';
import PaperGroupShape from 'Application/Viewer/Shapes/PaperGroupShape';
import PaperFrame from 'Application/Viewer/Shapes/PaperFrame';

/**
 * @property {string} labeledObjectType
 * @property {LegacyLabelStructureInterface} structure
 * @property {Object} annotation
 * @property {Array<{header: string, offset: int?, limit: init?}>} sections
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {PaperShape} selectedPaperShape
 */

export default class LabelSelectorController {
  /**
   * @param {angular.$scope} $scope
   * @param {angular.$rootScope} $rootScope
   * @param {angular.$location} $location
   * @param {LinearLabelStructureVisitor} linearLabelStructureVisitor
   * @param {AnnotationLabelStructureVisitor} annotationStructureVisitor
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {EntityIdService} entityIdService
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param {ShapeSelectionService} shapeSelectionService
   */
  constructor($scope,
              $rootScope,
              $location,
              linearLabelStructureVisitor,
              annotationStructureVisitor,
              labeledFrameGateway,
              labeledThingGateway,
              labeledThingInFrameGateway,
              entityIdService,
              modalService,
              applicationState,
              taskGateway,
              shapeSelectionService) {
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
     * @type {angular.$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {angular.$location}
     * @private
     */
    this._$location = $location;

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
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

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
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ApplicationState}
     * @private
     */
    this._applicationState = applicationState;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {Number|null}
     */
    this.activePageIndex = null;

    /**
     * @type {string}
     */
    this.viewStyle = 'list';

    /**
     * @type {boolean}
     */
    this.multiSelection = false;

    /**
     * @type {Object}
     */
    this.accordionControl = {};

    /**
     * @type {ShapeSelectionService}
     * @private
     */
    this._shapeSelectionService = shapeSelectionService;

    $rootScope.$on('selected-paper-shape:after', (event, newSelectedPaperShape, selectedLabeledStructureObject) => {
      if (newSelectedPaperShape === null) {
        return this._clearLabelSelector();
      }
      // TODO: Find the root caus why the selectedLabelStructureObject here is different from the one in the
      //       controller where we emitted it
      this.selectedLabelStructureObject = selectedLabeledStructureObject;
      this._startWithFirstPageOfLabelSelector();
    });

    $scope.$watchGroup(
      [
        'vm.labelStructure',
        'vm.selectedLabelStructureObject',
      ],
      ([
         newLabelStructure,
         newSelectedLabelStructureObject,
       ]) => {
        if (newLabelStructure === null || newSelectedLabelStructureObject === null) {
          return this._clearLabelSelector();
        }
        this._startWithFirstPageOfLabelSelector();
      });

    // Store and process choices made by the user
    $scope.$watch('vm.choices', newChoices => {
      const labeledObject = this._getSelectedLabeledObject();
      if (!labeledObject || newChoices === null) {
        return;
      }

      const labels = Object.values(this.choices).filter(
        choice => choice !== null
      );

      if (equals(labeledObject.classes, labels)) {
        return;
      }

      labeledObject.setClasses(labels);
      let labeledThingNeedsUpdate = false;

      if (labeledObject instanceof LabeledThingInFrame) {
        const labeledThingInFrame = labeledObject;
        const {labeledThing} = labeledThingInFrame;

        if (labeledThingInFrame.ghost === true) {
          const {frameIndex} = labeledThingInFrame;
          const ltifId = this._entityIdService.getUniqueId();

          labeledThingInFrame.ghostBust(ltifId, labeledThingInFrame.frameIndex);

          if (frameIndex > labeledThing.frameRange.endFrameIndex) {
            labeledThing.frameRange.endFrameIndex = frameIndex;
            labeledThingNeedsUpdate = true;
          }

          if (frameIndex < labeledThing.frameRange.startFrameIndex) {
            labeledThing.frameRange.startFrameIndex = frameIndex;
            labeledThingNeedsUpdate = true;
          }
        }
      }

      this._updatePagesAndChoices();
      this._storeUpdatedLabeledObject(labeledThingNeedsUpdate);
    }, true);

    $scope.$watch('vm.activePageIndex', newPageIndex => {
      if (newPageIndex !== undefined && newPageIndex !== null) {
        this.labelingInstructions = this.pages[newPageIndex].instructions;
      }
    });
  }

  /**
   * @returns {boolean}
   */
  show() {
    const hasOnlyOneShapeSelected = (this._shapeSelectionService.count() === 1);
    return hasOnlyOneShapeSelected;
  }

  /**
   * Sets active page to null and updates pages an choices
   *
   * @private
   */
  _startWithFirstPageOfLabelSelector() {
    this.activePageIndex = null;
    this._updatePagesAndChoices();
  }

  /**
   * Clears some variables of the label selector
   *
   * @private
   */
  _clearLabelSelector() {
    this.pages = null;
    this.activePageIndex = null;
    this.labelingInstructions = null;
    this.choices = null;
  }

  /**
   * @returns {LabeledThingInFrame}
   * @private
   */
  _getSelectedLabeledObject() {
    switch (true) {
      case this.selectedPaperShape instanceof PaperThingShape:
        return this.selectedPaperShape.labeledThingInFrame;
      case this.selectedPaperShape instanceof PaperGroupShape:
        return this.selectedPaperShape.labeledThingGroupInFrame;
      case this.selectedPaperShape instanceof PaperFrame:
        return this.selectedPaperShape.labeledFrame;
      default:
        return null;
    }
  }

  /**
   * Generate a valid set of pages to be rendered to the Wizzard View
   *
   * Pages depend on the `labelObject`, the `structure` as well as the `annotation`
   *
   * @private
   */
  _updatePagesAndChoices() {
    const selectedLabeledObject = this._getSelectedLabeledObject();
    if (selectedLabeledObject === null) {
      return;
    }
    if (!this.labelStructure) {
      return;
    }
    if (!this.selectedLabelStructureObject) {
      return;
    }

    const classList = selectedLabeledObject.extractClassList();
    const list = this.labelStructure.getEnabledClassesForLabeledObjectAndClassList(
      this.selectedLabelStructureObject,
      classList
    );

    // There seems to be a race between selectedLabelStructure and labeledObject wich could remove properties.
    // TODO: find the source of the race condition and eliminate the problem there!
    if (!this._labelStructureFitsLabeledObject(this.selectedLabelStructureObject, this.selectedPaperShape)) {
      return;
    }

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
          selectedLabeledObject.setClasses(
            selectedLabeledObject.classes.filter(
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
   * @param {boolean?} updateAssociatedLabeledThing
   * @private
   */
  _storeUpdatedLabeledObject(updateAssociatedLabeledThing = false) {
    // Store reference in case it is changed while being stored.
    const selectedLabeledObject = this._getSelectedLabeledObject();

    switch (true) {
      case selectedLabeledObject instanceof LabeledThingInFrame:
        this._storeUpdatedLabeledThingInFrame(selectedLabeledObject, updateAssociatedLabeledThing)
          .then(() => this._$rootScope.$emit('shape:class-update:after', selectedLabeledObject.classes));
        break;
      case selectedLabeledObject instanceof LabeledFrame:
        this._storeUpdatedLabeledFrame(selectedLabeledObject)
          .then(() => this._$rootScope.$emit('shape:class-update:after', selectedLabeledObject.classes));
        break;
      default:
        throw new Error(`Unknown labeledObject type: Unable to send updates to the backend.`);
    }
  }

  /**
   * Store the updates to a LabeledThingInFrame to the backend
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {boolean} updateAssociatedLabeledThing
   * @private
   */
  _storeUpdatedLabeledThingInFrame(labeledThingInFrame, updateAssociatedLabeledThing) {
    labeledThingInFrame.incomplete = !this._isCompleted();
    let storagePromise = Promise.resolve();
    if (updateAssociatedLabeledThing) {
      const {labeledThing} = labeledThingInFrame;
      storagePromise = storagePromise
        .then(() => this._labeledThingGateway.saveLabeledThing(labeledThing));
    }
    storagePromise = storagePromise
      .then(() => this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame));

    return storagePromise;
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

    labeledFrame.incomplete = !this._isCompleted();

    return this._labeledFrameGateway.saveLabeledFrame(
      this.task,
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

  handleLabelSelectionClick(id) {
    const index = this.pages.findIndex(element => {
      return element.id === id;
    });
    if (this.pages[index + 1]) {
      this.accordionControl.expand(this.pages[index + 1].id);
    }
  }

  /**
   * @param {LabelStructureObject} labelStructureObject
   * @param {PaperShape} selectedPaperShape
   * @return {boolean}
   * @private
   */
  _labelStructureFitsLabeledObject(labelStructureObject, selectedPaperShape) {
    let labeledObjectType;

    // For some shapes the database shape type and the requirements shape type are not the same.
    // Therefor we need a mapping!
    switch (true) {
      case selectedPaperShape instanceof PaperThingShape:
        labeledObjectType = this._normalizeLabeledObjectType(selectedPaperShape.labeledThingInFrame.shapes[0].type);
        break;
      case selectedPaperShape instanceof PaperGroupShape:
        labeledObjectType = 'group-rectangle';
        break;
      case selectedPaperShape instanceof PaperFrame:
        labeledObjectType = 'frame-shape';
        break;
      default:
        throw new Error('Can not get shape type of unknown paper shape');
    }

    return labelStructureObject.shape === labeledObjectType;
  }

  /**
   * @param {string} labeledObjectShapeType
   * @return {string}
   * @private
   */
  _normalizeLabeledObjectType(labeledObjectShapeType) {
    switch (labeledObjectShapeType) {
      case 'cuboid3d':
        return 'cuboid';
      default:
        return labeledObjectShapeType;
    }
  }
}

LabelSelectorController.$inject = [
  '$scope',
  '$rootScope',
  '$location',
  'linearLabelStructureVisitor',
  'annotationLabelStructureVisitor',
  'labeledFrameGateway',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
  'entityIdService',
  'modalService',
  'applicationState',
  'taskGateway',
  'shapeSelectionService',
];
