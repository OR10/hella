import FramePosition from '../Model/FramePosition';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

import Filters from '../../Viewer/Models/Filters';
import BrightnessFilter from '../../Common/Filters/BrightnessFilter';
import ContrastFilter from '../../Common/Filters/ContrastFilter';

import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';
import PaperFrame from '../../Viewer/Shapes/PaperFrame';
import PaperMeasurementRectangle from '../../Viewer/Shapes/PaperMeasurementRectangle';

class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$q} $q
   * @param {Object} $stateParams
   * @param {{task: Task, video: Video}} initialData
   * @param {User} user
   * @param {Object} userPermissions
   * @param {$location} $location
   * @param {ApplicationState} applicationState
   * @param {angular.$timeout} $timeout
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {FrameIndexService} frameIndexService
   * @param {LockService} lockService
   * @param {LabelStructureService} labelStructureService
   * @param {GroupCreationService} groupCreationService
   */
  constructor($scope,
              $q,
              $stateParams,
              initialData,
              user,
              userPermissions,
              $location,
              applicationState,
              $timeout,
              keyboardShortcutService,
              frameIndexService,
              lockService,
              labelStructureService,
              groupCreationService) {
    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

    /**
     * @type {angular.$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {GroupCreationService}
     * @private
     */
    this._groupCreationService = groupCreationService;

    /**
     * @type {string}
     */
    this.taskPhase = $stateParams.phase;

    /**
     * @type {Task}
     */
    this.task = initialData.task;

    /**
     * @type {Video}
     */
    this.video = initialData.video;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {$location}
     * @private
     */
    this._$location = $location;

    /**
     * @type {Filters}
     */
    this.filters = new Filters();

    /**
     * Value of the brightness slider
     *
     * @type {int}
     */
    this.brightnessSliderValue = 0;

    /**
     * Value of the contrast slider
     *
     * @type {int}
     */
    this.contrastSliderValue = 0;

    /**
     * Flag indicating whether all {@link LabeledThingInFrame}, which are not selected should be hidden or not
     *
     * @type {boolean}
     */
    this.hideLabeledThingsInFrame = false;

    /**
     * Currently active frame position to be displayed inside the MediaControls
     *
     * This model will be manipulated by different directives in order to switch between frames.
     *
     * @type {FramePosition}
     */
    this.framePosition = new FramePosition(lockService, frameIndexService.getFrameIndexLimits(), this._getFrameIndexFromUrl());

    /**
     * Number of the currently bookmarked frame
     *
     * @type {Number|null}
     */
    this.bookmarkedFrameIndex = null;

    /**
     * @type {boolean}
     */
    this.leftSideDisabled = false;

    /**
     * @type {boolean}
     */
    this.leftSideWorking = false;

    /**
     * @type {boolean}
     */
    this.rightSidebarDisabled = false;

    /**
     * @type {boolean}
     */
    this.rightSidebarWorking = false;

    /**
     * Currently active {@link BrightnessFilter}
     *
     * @type {BrightnessFilter|null}
     * @private
     */
    this._brightnessFilter = null;

    /**
     * Currently active {@link ContrastFilter}
     *
     * @type {ContrastFilter|null}
     * @private
     */
    this._constrastFilter = null;

    /**
     * @TODO Move into LabelSelector when refactoring for different task types
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledFrameBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @TODO Move into LabelSelector when refactoring for different task types
     * The LabeledFrame for the currently active frame
     *
     * @type {LabeledFrame|null}
     */
    this.labeledFrame = null;

    /**
     * @type {Tool|null}
     */
    this.activeTool = null;

    /**
     * @type {PaperShape|null}
     */
    this.selectedPaperShape = null;

    /**
     * @type {Object[]}
     */
    this.drawableThings = [];

    /**
     * @type {Object[]}
     */
    this.drawableGroups = [];

    /**
     * @type {Object[]}
     */
    this.drawableRequirementFrames = [];

    /**
     * @type {LabelStructure|null}
     */
    this.labelStructure = null;

    /**
     * Promise resolved once the initial load of the labelstructure has been completed
     *
     * @type {Promise}
     * @private
     */
    this._labelStructurePromise = null;

    /**
     * @type {{id, shape, name}|null}
     */
    this.selectedLabelStructureObject = null;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledFrameBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {boolean}
     */
    this.popupPanelState = false;

    /**
     * @type {number}
     */
    this.thumbnailZoomLevel = 100;

    /**
     * @type {ThingLayer}
     */
    this.thingLayer = null;

    keyboardShortcutService.registerOverlay('labeling-task', true);

    $scope.$on('$destroy', () => {
      keyboardShortcutService.removeOverlayById('labeling-task');
    });

    this._labelStructurePromise = this._initializeLabelStructure();

    $scope.$watch('vm.selectedPaperShape', (newShape, oldShape) => {
      if (newShape !== oldShape && newShape !== null) {
        // @TODO: Should be loaded in the resolver of the viewer. This would make synchronization easier
        this._labelStructurePromise
          .then(labelStructure => {
            let thingIdentifier;
            let labelStructureObject;

            switch (true) {
              case newShape instanceof PaperThingShape:
                if (!newShape.labeledThingInFrame.identifierName || newShape.labeledThingInFrame.identifierName === null) {
                  throw new Error('Identifier needs to be set and can not be null');
                }
                thingIdentifier = newShape.labeledThingInFrame.identifierName;
                labelStructureObject = labelStructure.getThingById(thingIdentifier);
                break;
              case newShape instanceof PaperGroupShape:
                thingIdentifier = newShape.labeledThingGroupInFrame.labeledThingGroup.type;
                labelStructureObject = labelStructure.getGroupById(thingIdentifier);
                break;
              case newShape instanceof PaperFrame:
                labelStructureObject = labelStructure.getRequirementFrameById('__meta-labeling-frame-identifier__');
                break;
              case newShape instanceof PaperMeasurementRectangle:
                labelStructureObject = {
                  id: 'measurement-rectangle',
                  name: 'Rectangle Measurement',
                  shape: 'measurement-rectangle',
                };
                break;
              default:
                throw new Error('Cannot read identifier name of unknown shape!');
            }

            this.selectedLabelStructureObject = labelStructureObject;

            // TODO: Fix the root cause for the reason that the labelStructureObject is different to the one
            //       in the label selector controller $on method!
            $scope.$root.$emit('selected-paper-shape:after', this.selectedPaperShape, labelStructureObject);
          });
      }
    });

    this._initializeLayout();

    // Update BrightnessFilter if value changed
    $scope.$watch(
      'vm.brightnessSliderValue', newBrightness => {
        const newFilter = new BrightnessFilter(parseInt(newBrightness, 10));
        if (!this._brightnessFilter) {
          this.filters.addFilter(newFilter);
        } else {
          this.filters.replaceFilter(this._brightnessFilter, newFilter);
        }
        this._brightnessFilter = newFilter;
      }
    );

    // Update ContrastFilter if value changed
    $scope.$watch(
      'vm.contrastSliderValue', newContrast => {
        const newFilter = new ContrastFilter(parseInt(newContrast, 10));
        if (!this._constrastFilter) {
          this.filters.addFilter(newFilter);
        } else {
          this.filters.replaceFilter(this._constrastFilter, newFilter);
        }
        this._constrastFilter = newFilter;
      }
    );

    $scope.$watchGroup(['vm.framePosition.position', 'vm.selectedPaperShape'], (newValues, oldValues) => {
      const oldPosition = oldValues[0];
      const newPosition = newValues[0];
      const oldShape = oldValues[1];
      const newShape = newValues[1];

      if (newPosition !== oldPosition || newShape !== oldShape || $location.hash() === '') {
        if (newShape && newShape.labeledThingInFrame && newShape.labeledThingInFrame.id !== null) {
          $location.hash(`${newPosition}/${newShape.labeledThingInFrame.id}`);
        } else {
          $location.hash(`${newPosition}`);
        }
      }
    });

    $scope.$watch(() => $location.hash(), (newHash, oldHash) => {
      if (newHash !== oldHash) {
        this.framePosition.goto(this._getFrameIndexFromUrl());
        this._selectLabeledThingInFrameFromUrl();
      }
    });

    this.framePosition.afterFrameChangeOnce('selectNextIncomplete', () => {
      this._selectLabeledThingInFrameFromUrl();
    });

    // @TODO: Only needed as long as the left sidebar is not used and only shown for the panel
    $scope.$watch('vm.popupPanelOpen', () => $timeout(() => $scope.$broadcast('sidebar.resized'), 1));

    applicationState.$watch('sidebarLeft.isDisabled', disabled => this.leftSidebarDisabled = disabled);
    applicationState.$watch('sidebarLeft.isWorking', working => this.leftSidebarWorking = working);
    applicationState.$watch('sidebarRight.isDisabled', disabled => this.rightSidebarDisabled = disabled);
    applicationState.$watch('sidebarRight.isWorking', working => this.rightSidebarWorking = working);
    applicationState.$watch('sidebarRight.isInFrameChange', inFrameChange => this.rightSidebarShowBackdrop = !inFrameChange);
  }

  /**
   * Initialize the `labelStructure` property as well as all the dependant values.
   *
   * Dependant values are:
   *
   * - `selectedLabelStructureObject`
   * - `drawableThings`
   * - `drawableGroups`
   * - `drawableRequirementFrames`
   *
   * All of these values will be *nulled* before the update and filled as soon as the needed {@link LabelStructure}
   * was retrieved.
   *
   * The operation is asynchronous!
   *
   * @return {Promise.<LabelStructure>}
   * @private
   */
  _initializeLabelStructure() {
    this.labelStructure = null;
    this.selectedLabeledStructureObject = null;
    this.drawableThings = [];
    this.drawableGroups = [];
    this.drawableRequirementFrames = [];

    const labelStructurePromise = this._labelStructureService.getLabelStructure(this.task)
      .then(labelStructure => {
        const labelStructureThingArray = Array.from(labelStructure.getThings().values());
        const labelStructureGroupArray = Array.from(labelStructure.getGroups().values());
        const labelStructureFrameArray = Array.from(labelStructure.getRequirementFrames().values());

        let labelStructureObject;
        const labelStructureObjects = [].concat(labelStructureThingArray, labelStructureGroupArray, labelStructureFrameArray);
        if (labelStructureObjects.length > 0) {
          labelStructureObject = labelStructureObjects[0];
        } else {
          throw new Error('No valid label structure object defined in requirements.xml');
        }

        this.labelStructure = labelStructure;
        this.selectedLabelStructureObject = labelStructureObject;
        this.drawableThings = labelStructureThingArray;
        this.drawableGroups = labelStructureGroupArray;
        this._groupCreationService.setAvailableGroups(this.drawableGroups);
        this.drawableRequirementFrames = labelStructureFrameArray;
        this.activeTool = 'multi';

        // Pipe labelStructure to next chain function
        return labelStructure;
      });

    return labelStructurePromise;
  }

  onSplitViewInitialized() {
    this.$scope.$broadcast('sidebar.resized');
  }

  _initializeLayout() {
    const sidebarSizeCss = `${6 / 24 * 100}%`;
    // const viewerSizeCss = `${14 / 24 * 100}%`;
    const viewerSizeCss = `${18 / 24 * 100}%`;

    // this.splitViewSizes = [sidebarSizeCss, viewerSizeCss, sidebarSizeCss];
    this.splitViewSizes = [null, viewerSizeCss, sidebarSizeCss];
    // this.minSizes = [260, 500, 260];
    this.minSizes = [500, 260];
  }

  onSidebarResized() {
    this.$scope.$broadcast('sidebar.resized');
  }

  _selectLabeledThingInFrameFromUrl() {
    const hash = this._$location.hash();
    const match = hash.split('/')[1];

    if (!match) {
      return;
    }
    this._$timeout(() => {
      const shape = this.paperThingShapes.find(element => {
        return match === element.labeledThingInFrame.id;
      });
      if (shape) {
        this.selectedPaperShape = shape;
        this.thingLayer.update();
      }
    });
  }

  _getFrameIndexFromUrl() {
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();

    const hash = this._$location.hash().split('/')[0];
    const matches = hash.match(/(\d+)/);

    if (!matches || matches.length < 2 || !matches[1]) {
      return frameIndexLimits.lowerLimit;
    }

    const frameIndex = parseInt(matches[1], 10);

    if (
      !Number.isInteger(frameIndex)
      || frameIndex < frameIndexLimits.lowerLimit
      || frameIndex > frameIndexLimits.upperLimit
    ) {
      return frameIndexLimits.lowerLimit;
    }

    return frameIndex;
  }
}

TaskController.$inject = [
  '$scope',
  '$q',
  '$stateParams',
  'initialData',
  'user',
  'userPermissions',
  '$location',
  'applicationState',
  '$timeout',
  'keyboardShortcutService',
  'frameIndexService',
  'lockService',
  'labelStructureService',
  'groupCreationService'
];

export default TaskController;
