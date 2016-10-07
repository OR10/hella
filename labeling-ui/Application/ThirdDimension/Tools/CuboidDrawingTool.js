import paper from 'paper';
import DrawingTool from '../../Viewer/Tools/DrawingTool';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import PaperCuboid from '../Shapes/PaperCuboid';
import CuboidInteractionResolver from '../Support/CuboidInteractionResolver';
import {Vector3} from 'three-math';
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
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Video} video
   * @param {Task} task
   */
  constructor($scope, drawingContext, loggerService, entityIdService, entityColorService, video, task) {
    super($scope, drawingContext, loggerService, entityIdService, entityColorService, video, task);

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {PaperRectangle}
     * @private
     */
    this._cuboid = null;

    /**
     * @type {String}
     * @private
     */
    this._color = this._entityColorService.getColorById(this._entityColorService.getColorId());

    /**
     * @type {DepthBufferProjection2d}
     * @private
     */
    this._projection2d = new DepthBufferProjection2d(
      new PlainProjection2d(this.video.calibration)
    );

    /**
     * @type {Projection3dFlatWorld}
     * @private
     */
    this._projection3d = new FlatWorld(this.video.calibration);

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

  onKeyPress(keyCode) {
    if (
      keyCode === 50
      && this._startCreation
      && this._topPoint
      && this._bottomPoint
      && this._sidePoint
      && this._cuboid
    ) {
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
        scope.view.update();
      });

      this.completeShape();
      this._cleanUp();
    }
  }

  /**
   * @param {Event} event
   */
  onMouseDown(event) {
    if (!this._startCreation) {
      this._topPoint = event.point;
      this.emit('tool:finished');
      return;
    }

    const point = event.point;
    if (this._topPoint && this._bottomPoint && !this._sidePoint) {
      if (this._projection3d.projectBottomCoordinateTo3d(point).x < 0) {
        this._$scope.$emit('drawingtool:exception', 'Drawing above the horizon is not possible. The invalid shape has been removed!');
        this._cleanUp();
        return;
      }

      this._sidePoint = point;
      this._heightLine.remove();
      this._widthLine.remove();

      const labeledThingInFrame = this._createLabeledThingHierarchy();

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
      this.completeShape();
      this._cleanUp();
    }
  }

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

  _getMinimalHeight() {
    return this._options.cuboid && this._options.cuboid.minimalHeight && this._options.cuboid.minimalHeight > 0 ? this._options.cuboid.minimalHeight : 1;
  }

  onMouseUp() {
    if (!this._startCreation) {
      this._cleanUp();
      return;
    }

    if (this._topPoint && this._bottomPoint) {
      if (this._topPoint.y > this._bottomPoint.y) {
        const tmpPoint = this._bottomPoint.clone();
        this._bottomPoint = this._topPoint.clone();
        this._topPoint.y = tmpPoint.y;
      }

      if (this._projection3d.projectBottomCoordinateTo3d(this._bottomPoint).x < 0) {
        this._$scope.$emit('drawingtool:exception', 'Drawing above the horizon is not possible. The invalid shape has been removed!');
        this._cleanUp();
      }
    }
  }

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

  _cleanUp() {
    this._topPoint = null;
    this._bottomPoint = null;
    this._sidePoint = null;

    if (this._heightLine) {
      this._heightLine.remove();
    }
    this._heightLine = null;

    if (this._widthLine) {
      this._widthLine.remove();
    }
    this._widthLine = null;

    this._startCreation = false;
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._cuboid.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._cuboid.toJSON());

    this.emit('shape:create', this._cuboid);
    this.emit('tool:finished');

    this._cuboid = null;
  }


  createNewDefaultShape() {
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
        this._projection2d,
        this._projection3d,
        points,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    this.completeShape();
  }
}

export default CuboidDrawingTool;
