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
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperRectangle}
   * @private
   */
  _createRectangle(labeledThingInFrame, shape) {
    return new PaperRectangle(labeledThingInFrame, shape.id, shape.topLeft, shape.bottomRight);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperEllipse}
   * @private
   */
  _createEllipse(labeledThingInFrame, shape) {
    return new PaperEllipse(labeledThingInFrame, shape.id, shape.point, shape.size);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperCircle}
   * @private
   */
  _createCircle(labeledThingInFrame, shape) {
    return new PaperCircle(labeledThingInFrame, shape.id, shape.point, shape.size.width / 2, 'red');
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperPoint}
   * @private
   */
  _createPoint(labeledThingInFrame, shape) {
    return new PaperPoint(labeledThingInFrame, shape.id, shape.point, 'red');
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperPath}
   * @private
   */
  _createPath(labeledThingInFrame, shape) {
    return new PaperPath(labeledThingInFrame, shape.id, shape.points, 'red');
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperPolygon}
   * @private
   */
  _createPolygon(labeledThingInFrame, shape) {
    return new PaperPolygon(labeledThingInFrame, shape.id, shape.points, 'red');
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperLine}
   * @private
   */
  _createLine(labeledThingInFrame, shape) {
    return new PaperLine(labeledThingInFrame, shape.id, shape.points, 'red');
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Object} shape
   * @returns {PaperShape}
   */
  createPaperShape(labeledThingInFrame, shape) {
    switch (shape.type) {
      case 'rectangle':
        return this._createRectangle(labeledThingInFrame, shape);
      case 'ellipse':
        return this._createEllipse(labeledThingInFrame, shape);
      case 'circle':
        return this._createCircle(labeledThingInFrame, shape);
      case 'point':
        return this._createPoint(labeledThingInFrame, shape);
      case 'path':
        return this._createPath(labeledThingInFrame, shape);
      case 'polygon':
        return this._createPolygon(labeledThingInFrame, shape);
      case 'line':
        return this._createLine(labeledThingInFrame, shape);
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }
  }
}

export default PaperShapeFactory;
