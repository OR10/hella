import FramePosition from '../Model/FramePosition';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

import Filters from '../../Viewer/Models/Filters';
import BrightnessFilter from '../../Common/Filters/BrightnessFilter';
import ContrastFilter from '../../Common/Filters/ContrastFilter';

class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$q} $q
   * @param {Object} $stateParams
   * @param {{task: Task, video: Video}} initialData
   * @param {User} user
   * @param {Object} userPermissions
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {$location} $location
   * @param {ApplicationState} applicationState
   * @param {angular.$timeout} $timeout
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {FrameIndexService} frameIndexService
   * @param {LockService} lockService
   * @param {LabelStructureService} labelStructureService
   */
  constructor($scope,
              $q,
              $stateParams,
              initialData,
              user,
              userPermissions,
              labeledFrameGateway,
              $location,
              applicationState,
              $timeout,
              keyboardShortcutService,
              frameIndexService,
              lockService,
              labelStructureService) {
    // Ensure the FrameIndexService knows the currently active Task
    frameIndexService.setTask(initialData.task);

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
     * Flag indicating whether all {@link LabeledThingsInFrame}, which are not selected should be hidden or not
     *
     * @type {boolean}
     */
    this.hideLabeledThingsInFrame = false;

    /**
     * Flag indicating whether or not to display the crosshairs inside the viewer
     *
     * @type {boolean}
     */
    this.showCrosshairs = false;

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
     * Drawing Tool used for initializing new empty shapes
     *
     * @type {Tool}
     */
    this.multiTool = null;

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
     * @type {LabeledFrameGateway}
     * @private
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {Object|null}
     */
    this.labelingStructure = null;

    /**
     * @type {Object|null}
     */
    this.labelingAnnotation = null;

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
     * @type {Object|null}
     */
    this.labelingStructure = null;

    /**
     * @type {Object|null}
     */
    this.labelingAnnotation = null;

    /**
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

    /**
     * @type {{id, shape, name}|null}
     */
    this.selectedThing = null;

    /**
     * @type {LabeledFrameGateway}
     */
    this._labeledFrameGateway = labeledFrameGateway;

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

    keyboardShortcutService.pushContext('labeling-task');

    $scope.$on('$destroy', () => {
      keyboardShortcutService.clearContext('labeling-task');
    });

    this._initializeLabelingStructure();
    this._setDrawingTool();

    $scope.$watch('vm.selectedPaperShape', (newShape, oldShape) => {
      if (newShape !== oldShape && newShape !== null) {
        this._labelStructureService.getThingByThingIdentifier(this.task.taskConfigurationId, newShape.labeledThingInFrame.identifierName).then(thing => {
          this.selectedThing = thing;
          this.selectedDrawingTool = thing.shape;
        });
        this._labelStructureService.getLabelStructure(this.task, newShape.labeledThingInFrame.identifierName).then(labelStructureData => {
          this.labelingStructure = labelStructureData.structure;
          this.labelingAnnotation = labelStructureData.annotation;
        });
      }
    });

    if (this.task.taskType === 'meta-labeling') {
      $scope.$watch('vm.framePosition.position', newPosition => {
        this.framePosition.lock.acquire();
        // Watch for changes of the Frame position to correctly update all
        // data structures for the new frame
        this._labeledFrameBuffer.add(this._loadLabeledFrame(newPosition))
          .aborted(() => {
            this.framePosition.lock.release();
          })
          .then(labeledFrame => {
            this.labeledFrame = labeledFrame;
            this.framePosition.lock.release();
          });
      });
    }

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

  _initializeLabelingStructure() {
    switch (this.task.taskType) {
      case 'object-labeling':
      case 'meta-labeling':
        this._labelStructureService.getLabelStructure(this.task).then(labelStructureData => {
          this.labelingStructure = labelStructureData.structure;
          this.labelingAnnotation = labelStructureData.annotation;
        });
        this._labelStructureService.getDrawableThings(this.task).then(drawableThings => {
          this.drawableThings = drawableThings;
        });
        break;
      default:
        throw new Error(`Unknown task type ${this.task.taskType}.`);
    }
  }

  _setDrawingTool() {
    this._labelStructureService.getDrawableThings(this.task).then(drawableThings => {
      if (drawableThings.length > 0) {
        this.selectedThing = drawableThings[0];
        this.selectedDrawingTool = drawableThings[0].shape;
      } else {
        throw new Error('No drawing tools available');
      }
    });
  }


  /**
   * Load the {@link LabeledFrame} structure for the given frame
   * @param frameIndex
   * @returns {AbortablePromise<LabeledFrame>}
   * @private
   */
  _loadLabeledFrame(frameIndex) {
    return this._labeledFrameGateway.getLabeledFrame(this.task.id, frameIndex);
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
      const labeledThingInFrame = this.labeledThingsInFrame.find(element => {
        return match === element.id;
      });
      if (labeledThingInFrame) {
        const shape = labeledThingInFrame.paperShapes[0];
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
  'labeledFrameGateway',
  '$location',
  'applicationState',
  '$timeout',
  'keyboardShortcutService',
  'frameIndexService',
  'lockService',
  'labelStructureService',
];

export default TaskController;
