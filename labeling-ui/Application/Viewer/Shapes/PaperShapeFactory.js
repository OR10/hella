import paper from 'paper';
import PaperRectangle from './PaperRectangle';
import PaperGroupRectangleMulti from './PaperGroupRectangleMulti';
import PaperGroupLineMulti from './PaperGroupLineMulti';
import PaperPedestrian from './PaperPedestrian';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import PaperPolygon from './PaperPolygon';
import PaperPolyline from './PaperPolyline';
import PaperPoint from './PaperPoint';

import PlainProjection2d from '../../ThirdDimension/Support/Projection2d/Plain';
import FlatWorld from '../../ThirdDimension/Support/Projection3d/FlatWorld';
import DepthBufferProjection2d from '../../ThirdDimension/Support/Projection2d/DepthBuffer';


/**
 * Factory to produce PaperShape objects from JSON representations stored in our backend
 */
class PaperShapeFactory {
  /**
   * @param {EntityColorService} entityColorService
   * @param {LabeledThingGroupService} labeledThingGroupService
   * @param {GroupNameService} groupNameService
   * @param {DrawClassShapeService} drawClassShapeService
   * @param {LabelStructureService} labelStructureService
   */
  constructor(entityColorService, labeledThingGroupService, groupNameService, drawClassShapeService, labelStructureService) {
    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;

    /**
     * @type {LabeledThingGroupService}
     * @private
     */
    this._labeledThingGroupService = labeledThingGroupService;

    /**
     * @type {GroupNameService}
     * @private
     */
    this._groupNameService = groupNameService;

    /**
     * @type {DrawClassShapeService}
     * @private
     */
    this._drawClassShapeService = drawClassShapeService;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @param taskClasses
   * @returns {PaperRectangle}
   * @private
   */
  _createRectangle(labeledThingInFrame, shape, color, taskClasses) {
    const topLeft = new paper.Point(shape.topLeft.x, shape.topLeft.y);
    const bottomRight = new paper.Point(shape.bottomRight.x, shape.bottomRight.y);

    return new PaperRectangle(labeledThingInFrame, shape.id, topLeft, bottomRight, color, this._drawClassShapeService, taskClasses);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingGroupInFrame
   * @param {Object} shapesInBound
   * @param {{primary: string, secondary: string}} color
   * @returns {PaperGroupRectangleMulti}
   * @private
   */
  _createGroupRectangle(labeledThingGroupInFrame, shapesInBound, color) {
    return new PaperGroupRectangleMulti(this._groupNameService, labeledThingGroupInFrame, labeledThingGroupInFrame.id, shapesInBound, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingGroupInFrame
   * @param {Object} shapesInBound
   * @param {{primary: string, secondary: string}} color
   * @returns {PaperGroupRectangleMulti}
   * @private
   */
  _createGroupLine(labeledThingGroupInFrame, shapesInBound, color) {
    return new PaperGroupLineMulti(this._groupNameService, labeledThingGroupInFrame, labeledThingGroupInFrame.id, shapesInBound, color);
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
   * @param {String} color
   * @param taskClasses
   * @returns {PaperPolyline}
   * @private
   */
  _createPolyline(labeledThingInFrame, shape, color, taskClasses) {
    return new PaperPolyline(labeledThingInFrame, shape.id, shape.points, color, this._drawClassShapeService, taskClasses);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperPoint}
   * @private
   */
  _createPoint(labeledThingInFrame, shape, color) {
    return new PaperPoint(labeledThingInFrame, shape.id, shape.point, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {Video} video
   * @returns {PaperShape}
   */
  createPaperThingShape(labeledThingInFrame, shape, taskClasses, video = null) {
    const color = this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor);
    let result;

    switch (shape.type) {
      case 'rectangle':
        result = this._createRectangle(labeledThingInFrame, shape, color, taskClasses);
        break;
      case 'pedestrian':
        result = this._createPedestrian(labeledThingInFrame, shape, color);
        break;
      case 'point':
        result = this._createPoint(labeledThingInFrame, shape, color);
        break;
      case 'cuboid3d':
        result = this._createCuboid(labeledThingInFrame, shape, color, video);
        break;
      case 'polygon':
        result = this._createPolygon(labeledThingInFrame, shape, color);
        break;
      case 'polyline':
        result = this._createPolyline(labeledThingInFrame, shape, color, taskClasses);
        break;
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }

    return result;
  }

  createPaperGroupShape(labeledThingGroupInFrame, shapesInGroup, drawType) {
    const colorId = parseInt(labeledThingGroupInFrame.labeledThingGroup.lineColor, 10);
    const color = this._entityColorService.getColorById(colorId);

    let paperGroup;
    switch (drawType) {
      case 'line':
        paperGroup = this._createGroupLine(labeledThingGroupInFrame, shapesInGroup, color);
        break;
      default:
        paperGroup = this._createGroupRectangle(labeledThingGroupInFrame, shapesInGroup, color);
    }

    // Place this group shape behind all other shapes
    paperGroup.sendToBack();

    return paperGroup;
  }
}

PaperShapeFactory.$inject = [
  'entityColorService',
  'labeledThingGroupService',
  'groupNameService',
  'drawClassShapeService',
  'labelStructureService',
];

export default PaperShapeFactory;
