import PaperRectangle from './PaperRectangle';
import PaperEllipse from './PaperEllipse';
import PaperCircle from './PaperCircle';
import PaperPoint from './PaperPoint';
import PaperPath from './PaperPath';
import PaperPolygon from './PaperPolygon';
import PaperLine from './PaperLine';

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
    return new PaperRectangle(labeledThingInFrame, shape.id, shape.topLeft, shape.bottomRight, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperEllipse}
   * @private
   */
  _createEllipse(labeledThingInFrame, shape, color) {
    return new PaperEllipse(labeledThingInFrame, shape.id, shape.point, shape.size, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @param {String} color
   * @returns {PaperCircle}
   * @private
   */
  _createCircle(labeledThingInFrame, shape, color) {
    return new PaperCircle(labeledThingInFrame, shape.id, shape.point, shape.size.width / 2, color);
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
   * @param {String} color
   * @returns {PaperPath}
   * @private
   */
  _createPath(labeledThingInFrame, shape, color) {
    return new PaperPath(labeledThingInFrame, shape.id, shape.points, color);
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
   * @returns {PaperLine}
   * @private
   */
  _createLine(labeledThingInFrame, shape, color) {
    return new PaperLine(labeledThingInFrame, shape.id, shape.points, color);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperShape}
   */
  createPaperShape(labeledThingInFrame, shape) {
    const color = this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor);

    switch (shape.type) {
      case 'rectangle':
        return this._createRectangle(labeledThingInFrame, shape, color);
      case 'ellipse':
        return this._createEllipse(labeledThingInFrame, shape, color);
      case 'circle':
        return this._createCircle(labeledThingInFrame, shape, color);
      case 'point':
        return this._createPoint(labeledThingInFrame, shape, color);
      case 'path':
        return this._createPath(labeledThingInFrame, shape, color);
      case 'polygon':
        return this._createPolygon(labeledThingInFrame, shape, color);
      case 'line':
        return this._createLine(labeledThingInFrame, shape, color);
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }
  }
}

PaperShapeFactory.$inject = ['entityColorService'];

export default PaperShapeFactory;
