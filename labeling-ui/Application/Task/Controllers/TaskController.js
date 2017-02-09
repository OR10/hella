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
     * Flag indicating whether all {@link LabeledThingInFrame}, which are not selected should be hidden or not
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
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

    /**
     * @type {{id, shape, name}|null}
     */
    this.selectedLabelStructureThing = null;

    /**
     * @type {LabeledObject|null}
     */
    this.selectedLabeledObject = null;

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

    this._labelStructurePromise = this._initializeLabelStructure();

    if (this.task.taskType === 'object-labeling') {
      $scope.$watch('vm.selectedPaperShape', (newShape, oldShape) => {
        if (newShape !== oldShape) {
          if (newShape !== null) {
            // @TODO: Should be loaded in the resolver of the viewer. This would make synchronization easier
            this._labelStructurePromise
              .then(labelStructure => {
                const thingIdentifier = newShape.labeledThingInFrame.identifierName !== null ? newShape.labeledThingInFrame.identifierName : 'legacy';
                const labelStructureThing = labelStructure.getThingById(thingIdentifier);

                this.selectedLabelStructureThing = labelStructureThing;
                this.selectedDrawingTool = labelStructureThing.shape;
                // The selectedObject needs to be set in the same cycle as the new LabelStructureThing. Otherwise there might be race conditions in
                // updating its structure against the wrong LabelStructureThing.
                this.selectedLabeledObject = this._getSelectedLabeledObject();
              });
          } else {
            this.selectedLabeledObject = null;
          }
        }
      });
    }

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
            this.selectedLabeledObject = this._getSelectedLabeledObject();
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

  /**
   * Retrieve the currently active `labeledObject`.
   *
   * The {@link LabeledObject} is determined based on the `labeledFrame` or the `selectedPaperShape`. It is not taken
   * from the `selectedLabeledObject` property. Actually this method is most likely to be used to update the
   * `selectedLabeledObject` property.
   *
   * @returns {LabeledObject|null}
   * @private
   */
  _getSelectedLabeledObject() {
    if (this.task.taskType === 'meta-labeling') {
      return this.labeledFrame;
    } else if (this.selectedPaperShape && this.selectedPaperShape.labeledThingInFrame) {
      return this.selectedPaperShape.labeledThingInFrame;
    }

    return null;
  }

  /**
   * Initialize the `labelStructure` property as well as all the dependant values.
   *
   * Dependant values are:
   *
   * - `selectedLabelStructureThing`
   * - `selectedDrawingTool`
   * - `selectedLabeledObject`
   * - `drawableThings`
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
    this.selectedLabeledStructureThing = null;
    this.selectedLabeledObject = null;
    this.selectedDrawingTool = null;
    this.drawableThings = [];

    const labelStructurePromise = this._labelStructureService.getLabelStructure(this.task)
      .then(labelStructure => {
        const labelStructureThingArray = Array.from(labelStructure.getThings().values());
        const labelStructureThing = labelStructureThingArray[0];

        this.labelStructure = labelStructure;
        this.selectedLabelStructureThing = labelStructureThing;
        this.selectedDrawingTool = labelStructureThing.shape;
        this.selectedLabeledObject = this._getSelectedLabeledObject();
        this.drawableThings = labelStructureThingArray;
        this.activeTool = 'multi';

        // Pipe labelStructure to next chain function
        return labelStructure;
      });

    return labelStructurePromise;
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
