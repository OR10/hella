// @TODO: Load from the server assigned to a certain task
import labeledFrameStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
import labeledFrameAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
import labeledThingStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
import labeledThingAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

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
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {$stateParams} $stateParams
   * @param {$location} $location
   */
  constructor($scope, initialData, user, labeledFrameGateway, $stateParams, $location) {
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
     * @type {$stateParams}
     * @private
     */
    this._$stateParams = $stateParams;

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
    this.framePosition = new FramePosition(this.task.frameRange, this._getInitialFrameNumber());

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

    this._initializeLabelingStructure();

    if (this.task.taskType === 'meta-labeling') {
      // Watch for changes of the Frame position to correctly update all
      // data structures for the new frame
      $scope.$watch(
        'vm.framePosition.position', newFramePosition => {
          this._labeledFrameBuffer.add(this._loadLabeledFrame(newFramePosition))
            .then(labeledFrame => this.labeledFrame = labeledFrame);
        }
      );
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
      console.log($location.search('frame', newPosition));
    });
  }

  _initializeLabelingStructure() {
    switch (this.task.taskType) {
      case 'object-labeling':
        this.labelingStructure = labeledThingStructure;
        this.labelingAnnotation = labeledThingAnnotation;
        break;
      case 'meta-labeling':
        this.labelingStructure = labeledFrameStructure;
        this.labelingAnnotation = labeledFrameAnnotation;
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
    const sidebarSizeCss = `${5 / 24 * 100}%`;
    const viewerSizeCss = `${14 / 24 * 100}%`;

    this.splitViewSizes = [sidebarSizeCss, viewerSizeCss, sidebarSizeCss];
  }

  onSidebarResized() {
    this.$scope.$broadcast('sidebar.resized');
  }

  _getInitialFrameNumber() {
    const initialFrameNumber = parseInt(this._$stateParams.frame, 10);

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
  'initialData',
  'user',
  'labeledFrameGateway',
  '$stateParams',
  '$location',
];

export default TaskController;
