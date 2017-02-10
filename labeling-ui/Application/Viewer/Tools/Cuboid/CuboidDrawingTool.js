import paper from 'paper';
import PaperShape from '../../Shapes/PaperShape';
import CreationTool from '../CreationTool';
import NotModifiedError from '../Errors/NotModifiedError';

import PaperCuboid from 'Application/ThirdDimension/Shapes/PaperCuboid';
import CuboidInteractionResolver from 'Application/ThirdDimension/Support/CuboidInteractionResolver';
import {Vector3} from 'three-math';
import DepthBufferProjection2d from 'Application/ThirdDimension/Support/Projection2d/DepthBuffer';
import PlainProjection2d from 'Application/ThirdDimension/Support/Projection2d/Plain';
import FlatWorld from 'Application/ThirdDimension/Support/Projection3d/FlatWorld';

/**
 * A tool for drawing three dimensional cuboids.
 */
class CuboidDrawingTool extends CreationTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService) {
    super(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService);

    /**
     * @type {PaperCuboid}
     * @private
     */
    this._cuboid = null;

    /**
     * @type {String}
     * @private
     */
    this._color = this._entityColorService.getColorById(this._entityColorService.getColorId());

    /**
     * @type {DepthBufferProjection2d|null}
     * @private
     */
    // this._projection2d = new DepthBufferProjection2d(
    //   new PlainProjection2d(this.video.calibration)
    // );
    this._projection2d = null;

    /**
     * @type {Projection3dFlatWorld|null}
     * @private
     */
    // this._projection3d = new FlatWorld(this.video.calibration);
    this._projection3d = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._topPoint = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._bottomPoint = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._sidePoint = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._heightLine = null;

    /**
     * @type {boolean}
     * @private
     */
    this._startCreation = false;
  }

  /**
   * @returns {string}
   */
  getToolName() {
    return 'cuboid';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'creation',
    ];
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    const {video} = toolActionStruct;
    this._initializeProjections(video.calibration);

    this._cuboid = null;
    this._startCreation = false;
    this._topPoint = null;
    this._bottomPoint = null;
    this._sidePoint = null;
    this._heightLine = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise.<PaperShape>}
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;
    this._initializeProjections(video.calibration);

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

    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    let cuboid = null;
    this._context.withScope(() => {
      cuboid = new PaperCuboid(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        this._projection2d,
        this._projection3d,
        points,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
      cuboid.remove();
    });

    return this._complete(cuboid);
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    this._cleanUp();
    return super.abort();
  }

  /**
   * @param {paper.Event} event
   */
  onKeyUp(event) {
    /*
     * The x key stops the creation after only two dimensions have been specified.
     */
    if (
      event.key !== 'x'
      || !this._startCreation
      || !this._topPoint
      || !this._bottomPoint
      || !this._sidePoint
      || !this._cuboid
    ) {
      return;
    }
    const bottom = this._projection3d.projectBottomCoordinateTo3d(new Vector3(this._bottomPoint.x, this._bottomPoint.y, 1));
    const top = this._projection3d.projectTopCoordinateTo3d(new Vector3(this._topPoint.x, this._topPoint.y, 1), bottom);
    const side = this._projection3d.projectBottomCoordinateTo3d(new Vector3(this._sidePoint.x, this._bottomPoint.y, 1));
    const sideTop = this._projection3d.projectTopCoordinateTo3d(new Vector3(this._sidePoint.x, this._topPoint.y, 1), side);

    let points;
    if (this._bottomPoint.x > this._sidePoint.x) {
      points = [
        [sideTop.x, sideTop.y, sideTop.z],
        [top.x, top.y, top.z],
        [bottom.x, bottom.y, bottom.z],
        [side.x, side.y, side.z],
        null,
        null,
        null,
        null,
      ];
    } else {
      points = [
        [top.x, top.y, top.z],
        [sideTop.x, sideTop.y, sideTop.z],
        [side.x, side.y, side.z],
        [bottom.x, bottom.y, bottom.z],
        null,
        null,
        null,
        null,
      ];
    }

    this._context.withScope(scope => {
      this._cuboid.setVertices(points);
      // scope.view.update();
    });

    this._cleanUp();
    this._complete(this._cuboid);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    const point = event.point;

    if (!this._startCreation) {
      this._topPoint = point;
      return;
    }

    if (this._topPoint && this._bottomPoint && !this._sidePoint) {
      if (this._projection3d.projectBottomCoordinateTo3d(point).x < 0) {
        this._$rootScope.$emit('drawingtool:exception', 'Drawing above the horizon is not possible. The invalid shape has been removed!');
        this._cleanUp();
        this._reject(new Error('Drawing above the horizon is not possible. The invalid shape has been removed!'));
        return;
      }

      this._sidePoint = point;
      this._heightLine.remove();
      this._widthLine.remove();

      const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

      const bottom = this._projection3d.projectBottomCoordinateTo3d(new Vector3(this._bottomPoint.x, this._bottomPoint.y, 1));
      const top = this._projection3d.projectTopCoordinateTo3d(new Vector3(this._topPoint.x, this._topPoint.y, 1), bottom);
      const side = this._projection3d.projectBottomCoordinateTo3d(new Vector3(this._sidePoint.x, this._sidePoint.y, 1));
      const sideTop = side.clone().add(top.clone().sub(bottom));

      let normal;
      let front;
      if (this._bottomPoint.x > this._sidePoint.x) {
        const vector1 = new Vector3(sideTop.x, sideTop.y, sideTop.z).sub(new Vector3(side.x, side.y, side.z));
        const vector2 = new Vector3(bottom.x, bottom.y, bottom.z).sub(new Vector3(side.x, side.y, side.z));
        normal = vector1.cross(vector2).normalize();
        front = [
          sideTop,
          top,
          bottom,
          side,
        ];
      } else {
        const vector1 = new Vector3(top.x, top.y, top.z).sub(new Vector3(bottom.x, bottom.y, bottom.z));
        const vector2 = new Vector3(side.x, side.y, side.z).sub(new Vector3(bottom.x, bottom.y, bottom.z));
        normal = vector1.cross(vector2).normalize();
        front = [
          top,
          sideTop,
          side,
          bottom,
        ];
      }
      const back = front.map(vertex => {
        return vertex.clone().add(normal);
      });

      const points = front.concat(back).map(vertex => {
        return [vertex.x, vertex.y, vertex.z];
      });

      this._context.withScope(() => {
        this._cuboid = new PaperCuboid(
          labeledThingInFrame,
          this._entityIdService.getUniqueId(),
          this._projection2d,
          this._projection3d,
          points,
          this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
          true
        );
      });

      return;
    }

    if (this._topPoint && this._bottomPoint && this._sidePoint) {
      this._cleanUp();
      this._complete(this._cuboid);
    }
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;
    this._startCreation = true;

    this._bottomPoint = this._topPoint.clone();
    this._bottomPoint.y = point.y;

    // Adhere to minimalHeight
    if (Math.abs(this._bottomPoint.y - this._topPoint.y) < this._getMinimalHeight()) {
      if (this._bottomPoint.y > this._topPoint.y) {
        // Top to bottom
        this._bottomPoint.y = this._topPoint.y + this._getMinimalHeight();
      } else {
        // Bottom to top
        this._bottomPoint.y = this._topPoint.y - this._getMinimalHeight();
      }
    }

    // Draw height line
    this._context.withScope(() => {
      if (this._heightLine) {
        this._heightLine.remove();
      }
      this._heightLine = new paper.Path.Line({
        from: this._topPoint,
        to: this._bottomPoint,
        strokeColor: this._color.secondary,
        strokeWidth: 2,
        strokeScaling: false,
        dashArray: PaperShape.LINE,
      });
    });
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    if (!this._startCreation) {
      this._cleanUp();
      this._reject(new NotModifiedError('No Cuboid was created/dragged.'));
      return;
    }

    if (this._topPoint && this._bottomPoint) {
      if (this._topPoint.y > this._bottomPoint.y) {
        const tmpPoint = this._bottomPoint.clone();
        this._bottomPoint = this._topPoint.clone();
        this._topPoint.y = tmpPoint.y;
      }

      if (this._projection3d.projectBottomCoordinateTo3d(this._bottomPoint).x < 0) {
        this._$rootScope.$emit('drawingtool:exception', 'Drawing above the horizon is not possible. The invalid shape has been removed!');
        this._cleanUp();
        this._reject(new Error('Drawing above the horizon is not possible. The invalid shape has been removed!'));
        return;
      }
    }
  }

  /**
   * @param {paper.Event} event
   */
  onMouseMove(event) {
    if (!this._startCreation) {
      return;
    }
    const point = event.point;

    if (this._topPoint && this._bottomPoint && !this._sidePoint) {
      this._context.withScope(() => {
        if (this._widthLine) {
          this._widthLine.remove();
        }
        this._widthLine = new paper.Path.Line({
          from: this._bottomPoint,
          to: point,
          strokeColor: this._color.secondary,
          strokeWidth: 2,
          strokeScaling: false,
          dashArray: PaperShape.LINE,
        });
      });
    }

    if (this._topPoint && this._bottomPoint && this._sidePoint && this._cuboid) {
      this._context.withScope(() => {
        this._cuboid.resize({name: CuboidInteractionResolver.DEPTH}, point, this._getMinimalHeight());
      });
    }
  }

  /**
   * @returns {number}
   * @private
   */
  _getMinimalHeight() {
    const {minimalHeight} = this._toolActionStruct.options;
    return minimalHeight && minimalHeight > 0 ? minimalHeight : 1;
  }

  /**
   * @private
   */
  _cleanUp() {
    if (this._cuboid) {
      this._cuboid.remove();
    }

    if (this._heightLine) {
      this._heightLine.remove();
    }

    if (this._widthLine) {
      this._widthLine.remove();
    }
  }

  /**
   * @param {Object} calibration
   * @private
   */
  _initializeProjections(calibration) {
    this._projection2d = new DepthBufferProjection2d(
      new PlainProjection2d(calibration)
    );

    this._projection3d = new FlatWorld(calibration);
  }
}

CuboidDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
];

export default CuboidDrawingTool;
