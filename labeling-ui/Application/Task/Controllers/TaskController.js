import FramePosition from '../Model/FramePosition';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

import Filters from '../../Viewer/Models/Filters';
import BrightnessFilter from '../../Common/Filters/BrightnessFilter';
import ContrastFilter from '../../Common/Filters/ContrastFilter';

class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {{task: Task, video: Video}} initialData
   * @param {User} user
   * @param {Object} userPermissions
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {LabelStructureGateway} labelStructureGateway
   * @param {TaskGateway} taskGateway
   * @param {$location} $location
   * @param {ApplicationState} applicationState
   * @param {angular.$timeout} $timeout
   */
  constructor($scope, $q, initialData, user, userPermissions, labeledFrameGateway, labelStructureGateway, taskGateway, $location, applicationState, $timeout) {
    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

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
     * Currently active frame position to be displayed inside the MediaControls
     *
     * This model will be manipulated by different directives in order to switch between frames.
     *
     * @type {FramePosition}
     */
    this.framePosition = new FramePosition($q, this.task.frameRange, this._getFrameNumberFromUrl());

    /**
     * Number of the currently bookmarked frame
     *
     * @type {Number|null}
     */
    this.bookmarkedFrameNumber = null;

    /**
     * Drawing Tool used for initializing new empty shapes
     *
     * @type {Tool}
     */
    this.newShapeDrawingTool = null;

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
     * @type {LabelStructureGateway}
     * @private
     */
    this._labelStructureGateway = labelStructureGateway;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

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
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

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

    this._initializeLabelingStructure();

    if (this.task.taskType === 'meta-labeling') {
      this.$scope.$watch('vm.framePosition.position', () => {
        this.framePosition.lock.acquire();
        // Watch for changes of the Frame position to correctly update all
        // data structures for the new frame
        this._labeledFrameBuffer.add(this._loadLabeledFrame(this.framePosition.position))
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

    $scope.$watch('vm.framePosition.position', newPosition => {
      $location.hash('F' + newPosition);
    });

    $scope.$watch(() => $location.hash(), () => {
      this.framePosition.goto(this._getFrameNumberFromUrl());
    });

    // @TODO: Only needed as long as the left sidebar is not used and only shown for the panel
    $scope.$watch('vm.popupPanelOpen', () => $timeout(() => $scope.$broadcast('sidebar.resized'), 1));

    applicationState.$watch('sidebarLeft.isDisabled', disabled => this.leftSidebarDisabled = disabled);
    applicationState.$watch('sidebarLeft.isWorking', working => this.leftSidebarWorking = working);
    applicationState.$watch('sidebarRight.isDisabled', disabled => this.rightSidebarDisabled = disabled);
    applicationState.$watch('sidebarRight.isWorking', working => this.rightSidebarWorking = working);

    if (!this.task.assignedUser) {
      this._taskGateway.assignUserToTask(this.task, this.user);
    }
  }

  _initializeLabelingStructure() {
    switch (this.task.taskType) {
      case 'object-labeling':
      case 'meta-labeling':
        this._labelStructureGateway.getLabelStructureData(this.task.id).then((labelStructureData) => {
          this.labelingStructure = labelStructureData.structure;
          this.labelingAnnotation = labelStructureData.annotation;
        });
        break;
      default:
        throw new Error(`Unknown task type ${this.task.taskType}.`);
    }
  }

  /**
   * Load the {@link LabeledFrame} structure for the given frame
   * @param frameNumber
   * @returns {AbortablePromise<LabeledFrame>}
   * @private
   */
  _loadLabeledFrame(frameNumber) {
    return this._labeledFrameGateway.getLabeledFrame(this.task.id, frameNumber);
  }

  onSplitViewInitialized() {
    this.$scope.$broadcast('sidebar.resized');
  }

  _initializeLayout() {
    const sidebarSizeCss = `${6 / 24 * 100}%`;
    //const viewerSizeCss = `${14 / 24 * 100}%`;
    const viewerSizeCss = `${18 / 24 * 100}%`;

    //this.splitViewSizes = [sidebarSizeCss, viewerSizeCss, sidebarSizeCss];
    this.splitViewSizes = [null, viewerSizeCss, sidebarSizeCss];
    //this.minSizes = [260, 500, 260];
    this.minSizes = [500, 260];
  }

  onSidebarResized() {
    this.$scope.$broadcast('sidebar.resized');
  }

  _getFrameNumberFromUrl() {
    const hash = this._$location.hash();
    const matches = hash.match(/F(\d+)/);

    if (!matches || matches.length < 2 || !matches[1]) {
      return this.task.frameRange.startFrameNumber;
    }

    const initialFrameNumber = parseInt(matches[1], 10);

    if (
      !Number.isInteger(initialFrameNumber)
      || initialFrameNumber < this.task.frameRange.startFrameNumber
      || initialFrameNumber > this.task.frameRange.endFrameNumber
    ) {
      return 1;
    }

    return initialFrameNumber;
  }
}

TaskController.$inject = [
  '$scope',
  '$q',
  'initialData',
  'user',
  'userPermissions',
  'labeledFrameGateway',
  'labelStructureGateway',
  'taskGateway',
  '$location',
  'applicationState',
  '$timeout',
];

export default TaskController;
