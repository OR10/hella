import DrawingTool from '../../Viewer/Tools/DrawingTool';
import PaperCuboid from '../Shapes/PaperCuboid';
import DepthBufferProjection2d from '../Support/Projection2d/DepthBuffer';
import PlainProjection2d from '../Support/Projection2d/Plain';
import FlatWorld from '../Support/Projection3d/FlatWorld';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class CuboidDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Video} task
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, video, options) {
    super($scope, drawingContext, entityIdService, entityColorService, options);

    /**
     * @type {PaperRectangle}
     * @private
     */
    this._cuboid = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._height = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._primaryCorner = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._width = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._depth = null;

    /**
     *
     */
    this._video = video;
  }

  onMouseDown(event) { // eslint-disable-line no-unused-vars
  }

  onMouseMove(event) { // eslint-disable-line no-unused-vars
  }

  onMouseDrag(event) { // eslint-disable-line no-unused-vars
  }

  onMouseUp() {
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._cuboid.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._cuboid.toJSON());

    this.emit('shape:new', this._cuboid);
    this._cuboid = null;
  }


  startShape(primary, height, width, depth) { // eslint-disable-line no-unused-vars
    const projection2d = new DepthBufferProjection2d(
      new PlainProjection2d(this._video.calibration)
    );
    const projection3d = new FlatWorld(this._video.calibration);

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    const points = [
      [
        10,
        1,
        1,
      ],
      [
        10,
        -1,
        1,
      ],
      [
        10,
        -1,
        0,
      ],
      [
        10,
        1,
        0,
      ],
      [
        11,
        1,
        1,
      ],
      [
        11,
        -1,
        1,
      ],
      [
        11,
        -1,
        0,
      ],
      [
        11,
        1,
        0,
      ],
    ];

    this._context.withScope(() => {
      this._cuboid = new PaperCuboid(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        projection2d,
        projection3d,
        points,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this.emit('cuboid:new', this._cuboid);
  }
}

export default CuboidDrawingTool;
