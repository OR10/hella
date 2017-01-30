import paper from 'paper';
import PaperRectangle from './PaperRectangle';
import PaperPedestrian from './PaperPedestrian';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import PaperPolygon from './PaperPolygon';

import PlainProjection2d from '../../ThirdDimension/Support/Projection2d/Plain';
import FlatWorld from '../../ThirdDimension/Support/Projection3d/FlatWorld';
import DepthBufferProjection2d from '../../ThirdDimension/Support/Projection2d/DepthBuffer';

/**
 * Factory to produce PaperShape objects from JSON representations stored in our backend
 */
class PaperShapeFactory {
  /**
   * @param {EntityColorService} entityColorService
   */
  constructor(entityColorService) {
    this._entityColorService = entityColorService;
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperRectangle}
   * @private
   */
  _createRectangle(labeledThingInFrame, shape, color) {
    const topLeft = new paper.Point(shape.topLeft.x, shape.topLeft.y);
    const bottomRight = new paper.Point(shape.bottomRight.x, shape.bottomRight.y);

    return new PaperRectangle(labeledThingInFrame, shape.id, topLeft, bottomRight, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperPedestrian}
   * @private
   */
  _createPedestrian(labeledThingInFrame, shape, color) {
    const topCenter = new paper.Point(shape.topCenter.x, shape.topCenter.y);
    const bottomCenter = new paper.Point(shape.bottomCenter.x, shape.bottomCenter.y);

    return new PaperPedestrian(labeledThingInFrame, shape.id, topCenter, bottomCenter, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @param {Video} video
   * @returns {PaperCuboid}
   * @private
   */
  _createCuboid(labeledThingInFrame, shape, color, video) {
    const projection2d = new DepthBufferProjection2d(
      new PlainProjection2d(video.calibration)
    );
    const projection3d = new FlatWorld(video.calibration);

    return new PaperCuboid(labeledThingInFrame, shape.id, projection2d, projection3d, shape.vehicleCoordinates, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperPolygon}
   * @private
   */
  _createPolygon(labeledThingInFrame, shape, color) {
    return new PaperPolygon(labeledThingInFrame, shape.id, shape.points, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {Video} video
   * @returns {PaperShape}
   */
  createPaperShape(labeledThingInFrame, shape, video = null) {
    const color = this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor);
    let result;

    switch (shape.type) {
      case 'rectangle':
        result = this._createRectangle(labeledThingInFrame, shape, color.primary);
        break;
      case 'pedestrian':
        result = this._createPedestrian(labeledThingInFrame, shape, color.primary);
        break;
      case 'cuboid3d':
        result = this._createCuboid(labeledThingInFrame, shape, color, video);
        break;
      case 'polygon':
        result = this._createPolygon(labeledThingInFrame, shape, color.primary);
        break;
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }
    labeledThingInFrame.paperShapes.push(result);
    return result;
  }
}

PaperShapeFactory.$inject = ['entityColorService'];

export default PaperShapeFactory;
