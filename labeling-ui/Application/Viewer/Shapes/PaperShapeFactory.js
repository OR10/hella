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
   * @returns {PaperRectangle}
   * @private
   */
  _createCenterLineRectangle(labeledThingInFrame, shape, color) {
    return new PaperLine(labeledThingInFrame, shape.id, shape.from, shape.to, color);
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
    let result;

    switch (shape.type) {
      case 'rectangle':
        result = this._createRectangle(labeledThingInFrame, shape, color);
        break;
      case 'center-line':
        result = this._createCenterLineRectangle(labeledThingInFrame, shape, color);
        break;
      case 'ellipse':
        result = this._createEllipse(labeledThingInFrame, shape, color);
        break;
      case 'circle':
        result = this._createCircle(labeledThingInFrame, shape, color);
        break;
      case 'point':
        result = this._createPoint(labeledThingInFrame, shape, color);
        break;
      case 'path':
        result = this._createPath(labeledThingInFrame, shape, color);
        break;
      case 'polygon':
        result = this._createPolygon(labeledThingInFrame, shape, color);
        break;
      case 'line':
        result = this._createLine(labeledThingInFrame, shape, color);
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
