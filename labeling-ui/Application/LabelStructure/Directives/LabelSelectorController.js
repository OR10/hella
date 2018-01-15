import angular from 'angular';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

import PaperThingShape from 'Application/Viewer/Shapes/PaperThingShape';
import PaperGroupShape from 'Application/Viewer/Shapes/PaperGroupShape';
import PaperFrame from 'Application/Viewer/Shapes/PaperFrame';
import LabeledThingGroupInFrame from '../../LabelingData/Models/LabeledThingGroupInFrame';
import PaperVirtualShape from '../../Viewer/Shapes/PaperVirtualShape';

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
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
   * @param {EntityIdService} entityIdService
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param {ShapeSelectionService} shapeSelectionService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {LabelStructureService} labelStructureService
   * @param {$q} $q
   * @param {$timeout} $timeout
   */
  constructor(
    $scope,
    $rootScope,
    $location,
    linearLabelStructureVisitor,
    annotationStructureVisitor,
    labeledFrameGateway,
    labeledThingGateway,
    labeledThingInFrameGateway,
    labeledThingGroupGateway,
    entityIdService,
    modalService,
    applicationState,
    taskGateway,
    shapeSelectionService,
    keyboardShortcutService,
    labelStructureService,
    $q,
    $timeout,
  ) {
    /**
     * Pages displayed by the wizzards
     * @type {Array|null}
     */
    this.pages = null;

    /**
     * Choices selected by the user inside the wizzards
     *
     * @type {Array.<string, string, bool>}
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
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;

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
     * @type {boolean}
     */
    this.showClasses = false;

    /**
     * @type {Object}
     */
    this.accordionControl = {};

    /**
     * @type {Object}
     */
    this.selectedOnlyAccordionControl = {};

    /**
     * @type {string}
     */
    this.searchAttributes = '';

    /**
     * @type {ShapeSelectionService}
     * @private
     */
    this._shapeSelectionService = shapeSelectionService;

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {Array}
     */
    this.allPossibleChoices = [];

    /**
     * @type {String}
     */
    this.selectedClassFilter = '';

    /**
     * @type {Boolean}
     */
    this.showClassSearchBar = false;

    this._labelStructureService.getLabelStructure(this.task)
      .then(labelStructure => {
        this.allPossibleChoices = labelStructure.getClasses();
      });

    $rootScope.$on('toggle-class-search', () => {
      if (!this._isLegacyProject()) {
        this.showClassSearchBar = !this.showClassSearchBar;
      }
    });

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
        this._clearSearchFilter();
        this._startWithFirstPageOfLabelSelector();
        this.expandOrCollapseAccordionOnMutiSelection();
      }
    );

    $scope.$watch('vm.activePageIndex', newPageIndex => {
      if (newPageIndex !== undefined && newPageIndex !== null) {
        this.labelingInstructions = this.pages[newPageIndex].instructions;
      }
    });

    $scope.$watch('vm.viewStyle', (newStyle, oldStyle) => {
      if (newStyle === oldStyle) {
        return;
      }
      if (newStyle === 'selectedOnly') {
        this.selectedOnlyAccordionControl.expandAll();
      }
    });

    keyboardShortcutService.registerOverlay('label-selector', false);
    this._keyboardShortcutService.addHotkey('label-selector', {
      combo: ['mod+f'],
      description: 'Set focus to search in the attribute list',
      callback: event => {
        const searchAttributesElement = angular.element(document.body).find('#searchAttributes');
        if (searchAttributesElement.val() !== undefined && event.preventDefault) {
          searchAttributesElement.focus();
          event.preventDefault();
        }
      },
    });
  }

  /**
   * @param {Object} response
   * @returns {boolean}
   */
  hideWhenItemIsNotSelected(response) {
    return !this.choices[response.id].selected;
  }

  _clearSearchFilter() {
    this.searchAttributes = '';
    this.applySearchFilter();
  }

  _isLegacyProject() {
    if (this.selectedLabelStructureObject === null) {
      return false;
    }

    return this.selectedLabelStructureObject.id === 'legacy';
  }
  /**
   * This method expand or collapse the accordions depends on the multiSelection state
   */
  expandOrCollapseAccordionOnMutiSelection() {
    if (this.multiSelection) {
      this.accordionControl.expandAll();
      this.selectedOnlyAccordionControl.expandAll();
    } else {
      this.accordionControl.collapseAll();
      this.selectedOnlyAccordionControl.collapseAll();
    }
  }

  /**
   * @returns {boolean}
   */
  show() {
    const selectedShape = this.selectedPaperShape;
    const hasPaperShape = (selectedShape !== undefined && selectedShape !== null);
    const hasAtMostOneSelectedShape = (this._shapeSelectionService.count() <= 1);
    const isVirtualShape = selectedShape instanceof PaperVirtualShape;

    return hasPaperShape && hasAtMostOneSelectedShape && !isVirtualShape;
  }

  showSearchBar() {
    const isLegacyProject = this._isLegacyProject();
    return this.show() && !isLegacyProject;
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
    let list;

    if (this.searchAttributes.length === 0) {
      list = this.labelStructure.getEnabledClassesForLabeledObjectAndClassList(
        this.selectedLabelStructureObject,
        classList
      );
    } else {
      list = this.labelStructure.getClassesForLabeledObject(this.selectedLabelStructureObject, classList);
    }
    // There seems to be a race between selectedLabelStructure and labeledObject which could remove properties.
    // TODO: find the source of the race condition and eliminate the problem there!
    if (!this._labelStructureFitsLabeledObject(this.selectedLabelStructureObject, this.selectedPaperShape)) {
      return;
    }

    const newChoices = [];
    let newPages = [];
    const seenPages = {};
    list.forEach(node => {
      const id = node.name;
      const page = {id};
      seenPages[id] = true;
      newPages.push(page);

      page.challenge = node.metadata.challenge;
      page.multiSelect = node.metadata.multiSelect;
      page.instructions = node.metadata.instructions;

      page.responses = node.children.map(
        child => ({id: child.name, response: child.metadata.response, iconClass: child.metadata.iconClass, value: this.getCorrectValueForNodeFromChild(node, child)})
      );

      page.responses.forEach(response => {
        const selected = response.value !== undefined;
        newChoices[response.id] = {selected: selected};
      });
    });

    if (this.searchAttributes.length > 0) {
      this.multiSelection = true;
      newPages = newPages.filter(page => {
        let returnValue = false;
        const searchValueInChallenge = page.challenge.toLowerCase().includes(this.searchAttributes.toLowerCase());
        const searchValueInId = page.id.toLowerCase().includes(this.searchAttributes.toLowerCase());

        if (searchValueInChallenge || searchValueInId) {
          returnValue = true;
        }

        let foundInPages = false;
        page.responses.forEach(res => {
          if (res.response.toLowerCase().includes(this.searchAttributes.toLowerCase())) {
            returnValue = true;
            foundInPages = true;
          }
        });

        if (foundInPages) {
          page.responses = page.responses.filter(res => {
            if (res.response.toLowerCase().includes(this.searchAttributes.toLowerCase())) {
              return true;
            }

            return false;
          });
        }

        return returnValue;
      });
    }

    this.pages = newPages;
    this.choices = newChoices;

    // Remove labels belonging to removed pages
    if (this.pages !== null) {
      this.pages.forEach(page => {
        const id = page.id;
        if (seenPages[id] === true) {
          return;
        }
        page.responses.forEach(response => {
          if (response.value !== undefined) {
            // Remove the chosen value from the labelsObject
            selectedLabeledObject.setClasses(
              selectedLabeledObject.classes.filter(
                label => label !== response.value
              )
            );
          }
        });
      });
    }

    if (this.activePageIndex === null && this.pages.length > 0) {
      this.activePageIndex = 0;
    }
  }

  getCorrectValueForNodeFromChild(node, child) {
    if (node.metadata.value === undefined || node.metadata.value === null) {
      return undefined;
    }
    return node.metadata.value.find(value => value === child.name);
  }

  applySearchFilter() {
    if (this.searchAttributes.length === 0) {
      this.multiSelection = false;
    }
    this._updatePagesAndChoices();
    this._$timeout(() => {
      this.expandOrCollapseAccordionOnMutiSelection();
    });
  }

  applySearchFilterSelection() {
    if (this.pages.length === 1 && this.pages[0].responses.length === 1) {
      const id = this.pages[0].responses[0].id;
      if (this.choices[id].selected) {
        this._clearSearchFilter();
      } else {
        this.choices[id] = {selected: true};
        this.handleLabelSelectionClick(this.pages[0], id);
      }
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
      case selectedLabeledObject instanceof LabeledThingGroupInFrame:
        this._storeUpdatedLabeledThingGroupInFrame(selectedLabeledObject)
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
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @private
   */
  _storeUpdatedLabeledThingGroupInFrame(labeledThingGroupInFrame) {
    labeledThingGroupInFrame.incomplete = !this._isCompleted();
    return this._labeledThingGroupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
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
    let inComplete = false;
    this.pages.forEach(page => {
      page.responses.forEach(response => {
        if (response.value !== undefined) {
          inComplete = true;
        }
      });
    });

    return inComplete;
  }

  isPageActive(index) {
    return index === this.activePageIndex;
  }

  isMultiAttributeSelection(page) {
    return page.multiSelect;
  }

  showCompleteCheckMark(page) {
    let checked = false;
    page.responses.forEach(response => {
      if (response.value !== undefined) {
        checked = true;
      }
    });
    return checked;
  }

  isResponseSelected(page, response) {
    if (this.choices === null) {
      return false;
    }
    if (this.isMultiAttributeSelection(page)) {
      const selectedLabeledObject = this._getSelectedLabeledObject();
      if (selectedLabeledObject !== null) {
        return selectedLabeledObject.classes.includes(response.id);
      }
    }
    if (this.choices[response.id] === undefined) {
      return false;
    }
    return this.choices[response.id].selected;
  }

  nextPage() {
    this.activePageIndex = Math.min(this.activePageIndex + 1, this.pages.length - 1);
  }

  previousPage() {
    this.activePageIndex = Math.max(this.activePageIndex - 1, 0);
  }

  _getRequiredValuesForValueToRemove(selectedLabeledObject, response) {
    const toRemoveResponses = this.labelStructure.getRequiredValuesForValueToRemove(response);
    toRemoveResponses.forEach(toRemoveResponse => {
      if (!this.labelStructure.isClassMultiSelectXMLClass(toRemoveResponse)) {
        this.labelStructure.getOtherClassesInnerClass(response).forEach(responseToRemove => {
          if (!this.labelStructure.isClassMultiSelectXMLClass(responseToRemove)) {
            this.labelStructure.getRequiredValuesForValueToRemove(responseToRemove).forEach(
              responseResponseToRemove => {
                selectedLabeledObject.removeClass(responseResponseToRemove);
              });
          }
        });
      }
      selectedLabeledObject.removeClass(toRemoveResponse);
    });
  }

  _getRequiredValuesForValue(selectedLabeledObject, response) {
    const neededResponses = this.labelStructure.getRequiredValuesForValue(response, selectedLabeledObject.identifierName);
    neededResponses.forEach(neededResponse => {
      if (!this.labelStructure.isClassMultiSelectXMLClass(neededResponse)) {
        this.labelStructure.getOtherClassesInnerClass(neededResponse).forEach(responseToRemove => {
          selectedLabeledObject.removeClass(responseToRemove);
        });
      }
      selectedLabeledObject.addClass(neededResponse);
    });
  }

  handleLabelSelectionClick(page, response) {
    const selectedLabeledObject = this._getSelectedLabeledObject();
    if (!selectedLabeledObject || this.choices === null) {
      return;
    }

    const responses = Object.keys(this.choices).filter(
      choice => this.choices[choice].selected && choice === response
    );

    if (!this._isLegacyProject()) {
      this._getRequiredValuesForValueToRemove(selectedLabeledObject, response);
      this._getRequiredValuesForValue(selectedLabeledObject, response);
    }

    let toDeleteLabel;
    if (responses.length === 0) {
      toDeleteLabel = Object.keys(this.choices).find(
        choice => !this.choices[choice].selected && choice === response
      );
    }

    if (this.isMultiAttributeSelection(page)) {
      this.multiSelection = true;
      if (toDeleteLabel === undefined) {
        if (selectedLabeledObject.classes.length === 0) {
          selectedLabeledObject.setClasses(responses);
        } else {
          const concatResponses = [...new Set(selectedLabeledObject.classes.concat(responses))];
          selectedLabeledObject.setClasses(concatResponses);
        }
      } else {
        selectedLabeledObject.removeClass(toDeleteLabel);
      }
    } else {
      const currentSelectedClass = page.responses.find(pageResponse => pageResponse.value !== undefined);
      if (currentSelectedClass === undefined && responses[0] !== undefined) {
        selectedLabeledObject.addClass(responses[0]);
      } else {
        if (selectedLabeledObject.classes.length > 1) {
          this.choices[currentSelectedClass.id].selected = !this.choices[currentSelectedClass.id].selected;
          selectedLabeledObject.removeClass(currentSelectedClass.value);
        }

        if (this.searchAttributes.length > 0) {
          this._getRequiredValuesForValueToRemove(selectedLabeledObject, currentSelectedClass.value);
        }
        if (responses[0] !== undefined) {
          selectedLabeledObject.addClass(responses[0]);
        }
      }
    }
    let labeledThingNeedsUpdate = false;

    if (selectedLabeledObject instanceof LabeledThingInFrame) {
      const labeledThingInFrame = selectedLabeledObject;
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

    this._$timeout(() => {
      const index = this.pages.findIndex(element => {
        return element.id === page.id;
      });
      if (this.pages[index + 1]) {
        this.accordionControl.expand(this.pages[index + 1].id);
      }
    }, 100);
    this._$rootScope.$emit('action:redraw-shape-with-class', this.task, this.selectedPaperShape);
  }

  /**
   * Get a meaningful title for the labelselector
   *
   * @returns {string}
   */
  getLabelSelectorTitle() {
    if (!this.selectedLabelStructureObject) {
      return 'Properties';
    } else if (this.selectedLabelStructureObject.name !== undefined) {
      return this.selectedLabelStructureObject.name;
    }

    return this.selectedLabelStructureObject.id;
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

  /**
   * Handle to jump to the next shape with class
   */
  handleJumpToNextShapeWithSelectedClass(direction = 'next') {
    if (this.selectedClassFilter.length === 0) {
      return;
    }
    this._labeledThingInFrameGateway.getLabeledThingInFrameByClassName(this.task, this.selectedClassFilter)
      .then(response => {
        if (response.length > 0) {
          let index = 0;
          const isActive = response.findIndex(ltif => {
            if (this.selectedPaperShape === null || this.selectedPaperShape.labeledThingInFrame === undefined) {
              return false;
            }
            return ltif.id === this.selectedPaperShape.labeledThingInFrame.id;
          });

          if (isActive !== -1 && direction === 'next' && (isActive + 1 < response.length)) {
            index = isActive + 1;
          }

          if (isActive !== -1 && direction === 'previous') {
            if (isActive - 1 === -1) {
              index = response.length - 1;
            } else {
              index = isActive - 1;
            }
          }

          if (response[index].frameIndex === this.framePosition.position) {
            this._selectLabeledThingInFrame(response[index]);
          } else {
            this._$q(resolve => {
              this.framePosition.afterFrameChangeOnce('selectNextShapeWithClass', () => {
                this._selectLabeledThingInFrame(response[index])
                  .then(() => resolve());
              });
              this.framePosition.goto(response[index].frameIndex);
            });
          }
        }
      });

    this._labeledThingGroupGateway.getLabeledThingGroupInFrameByClassName(this.task, this.selectedClassFilter)
      .then(response => {
        if (response.length > 0) {
          let index = 0;
          const isActive = response.findIndex(ltif => {
            if (this.selectedPaperShape === null || this.selectedPaperShape.labeledThingGroupInFrame === undefined) {
              return false;
            }
            return ltif.id === this.selectedPaperShape.labeledThingGroupInFrame.id;
          });

          if (isActive !== -1 && direction === 'next' && (isActive + 1 < response.length)) {
            index = isActive + 1;
          }

          if (isActive !== -1 && direction === 'previous') {
            if (isActive - 1 === -1) {
              index = response.length - 1;
            } else {
              index = isActive - 1;
            }
          }

          if (response[index].frameIndex === this.framePosition.position) {
            this._selectLabeledThingGroupInFrame(response[index]);
          } else {
            this._$q(resolve => {
              this.framePosition.afterFrameChangeOnce('selectNextShapeWithClass', () => {
                this._selectLabeledThingGroupInFrame(response[index])
                  .then(() => resolve());
              });
              this.framePosition.goto(response[index].frameIndex);
            });
          }
        }
      });
  }

  _selectLabeledThingInFrame(shape) {
    return this._$q(resolve => {
      this._$timeout(() => {
        const paperThingShape = this.paperThingShapes.find(thingShape => {
          return shape.id === thingShape.labeledThingInFrame.id;
        });
        this.selectedPaperShape = paperThingShape;
        this.hideLabeledThingsInFrame = true;
        resolve();
      });
    });
  }

  _selectLabeledThingGroupInFrame(shape) {
    return this._$q(resolve => {
      this._$timeout(() => {
        const paperGroupShapes = this.paperGroupShapes.find(thingShape => {
          return shape.id === thingShape.labeledThingGroupInFrame.id;
        });
        this.selectedPaperShape = paperGroupShapes;
        this.hideLabeledThingsInFrame = true;
        resolve();
      });
    });
  }

  canShowClassesOnSelectedPaperShape() {
    if (this.selectedPaperShape === null || this.selectedPaperShape instanceof PaperGroupShape) {
      return false;
    }
    return this.selectedPaperShape.canShowClasses();
  }

  handleShowClassesOnShapes() {
    if (this.selectedPaperShape === null) {
      return;
    }
    this._$rootScope.$emit('action:save-draw-classes');
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
  'labeledThingGroupGateway',
  'entityIdService',
  'modalService',
  'applicationState',
  'taskGateway',
  'shapeSelectionService',
  'keyboardShortcutService',
  'labelStructureService',
  '$q',
  '$timeout',
];
