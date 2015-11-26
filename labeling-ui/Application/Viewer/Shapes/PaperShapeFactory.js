import PaperRectangle from './PaperRectangle';
import PaperEllipse from './PaperEllipse';
import PaperCircle from './PaperCircle';
import PaperPoint from './PaperPoint';

class PaperShapeFactory {
  _createRectangle(shape) {
    return new PaperRectangle(shape.id, shape.labeledThingInFrameId, shape.topLeft, shape.bottomRight, 'red');
  }

  _createEllipse(shape) {
    return new PaperEllipse(shape.id, shape.labeledThingInFrameId, shape.point, shape.size, 'red');
  }

  _createCircle(shape) {
    return new PaperCircle(shape.id, shape.labeledThingInFrameId, shape.point, shape.size.width / 2, 'red');
  }

  _createPoint(shape) {
    return new PaperPoint(shape.id, shape.labeledThingInFrameId, shape.point, 'red');
  }

  createPaperShape(shape) {
    switch (shape.type) {
      case 'rectangle':
        return this._createRectangle(shape);
      case 'ellipse':
        return this._createEllipse(shape);
      case 'circle':
        return this._createCircle(shape);
      case 'point':
        return this._createPoint(shape);
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }
  }
}

export default PaperShapeFactory;
