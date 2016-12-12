import {equals} from 'angular';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

/**
 * @property {string} labeledObjectType
 * @property {LabeledObject} labeledObject
 * @property {LegacyLabelStructureInterface} structure
 * @property {Object} annotation
 * @property {Array<{header: string, offset: int?, limit: init?}>} sections
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {boolean} isCompleted
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
              taskGateway) {
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

    $scope.$watchGroup(
      [
        'vm.labelStructure',
        'vm.selectedLabelStructureThing',
        'vm.selectedLabeledObject',
      ],
      ([
        newLabelStructure,
        newSelectedLabelStructureThing,
        newSelectedLabeledObject,
      ])=> {
        if (newLabelStructure === null || newSelectedLabelStructureThing === null || newSelectedLabeledObject === null) {
          this.pages = null;
          this.activePageIndex = null;
          this.labelingInstructions = null;
          this.choices = null;
          return;
        }

        this.activePageIndex = null;
        this._updatePagesAndChoices();
      });

    // Store and process choices made by the user
    $scope.$watch('vm.choices', newChoices => {
      const labeledObject = this.selectedLabeledObject;
      if (!labeledObject || newChoices === null) {
        return;
      }

      const labels = Object.values(this.choices).filter(
        choice => choice !== null
      );

      if (equals(labeledObject.classes, labels)) {
        return;
      }

      this._$rootScope.$emit('shape:class-update:before', labels);

      labeledObject.setClasses(labels);

      if (labeledObject instanceof LabeledThingInFrame) {
        const labeledThingInFrame = labeledObject;
        const {labeledThing} = labeledThingInFrame;

        if (labeledThingInFrame.ghost === true) {
          const {frameIndex} = labeledThingInFrame;
          const ltifId = this._entityIdService.getUniqueId();

          labeledThingInFrame.ghostBust(ltifId, labeledThingInFrame.frameIndex);

          let frameRangeUpdated = false;

          if (frameIndex > labeledThing.frameRange.endFrameIndex) {
            labeledThing.frameRange.endFrameIndex = frameIndex;
            frameRangeUpdated = true;
          }

          if (frameIndex < labeledThing.frameRange.startFrameIndex) {
            labeledThing.frameRange.startFrameIndex = frameIndex;
            frameRangeUpdated = true;
          }

          if (frameRangeUpdated) {
            this._labeledThingGateway.saveLabeledThing(labeledThing)
              .then(() => this._storeUpdatedLabeledObject());
            return;
          }
        }
      }

      this._storeUpdatedLabeledObject();
      this._updatePagesAndChoices();
    }, true);

    $scope.$watch('vm.activePageIndex', newPageIndex => {
      if (newPageIndex !== undefined && newPageIndex !== null) {
        this.labelingInstructions = this.pages[newPageIndex].instructions;
      }
    });
  }

  /**
   * Extract a classList of a given {@link LabeledObject}
   *
   * @param {LabeledObject} labeledObject
   * @returns {Array.<string>}
   * @private
   */
  _extractClassList(labeledObject) {
    if (!labeledObject) {
      return [];
    }

    if (labeledObject.ghostClasses !== null) {
      return labeledObject.ghostClasses;
    }

    return labeledObject.classes;
  }

  /**
   * Generate a valid set of pages to be rendered to the Wizzard View
   *
   * Pages depend on the `labelObject`, the `structure` as well as the `annotation`
   *
   * @private
   */
  _updatePagesAndChoices() {
    const classList = this._extractClassList(this.selectedLabeledObject);
    const list = this.labelStructure.getEnabledThingClassesForThingAndClassList(
      this.selectedLabelStructureThing,
      classList
    );
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
          this.selectedLabeledObject.setClasses(
            this.selectedLabeledObject.classes.filter(
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
    // Store reference in case it is changed while being stored.
    const selectedLabeledObject = this.selectedLabeledObject;

    switch (true) {
      case selectedLabeledObject instanceof LabeledThingInFrame:
        this._storeUpdatedLabeledThingInFrame(selectedLabeledObject)
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
   * @private
   */
  _storeUpdatedLabeledThingInFrame(labeledThingInFrame) {
    labeledThingInFrame.incomplete = !this.isCompleted;

    return this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
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

    return this._labeledFrameGateway.saveLabeledFrame(
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
];
