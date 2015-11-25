import PaperRectangle from './PaperRectangle';

class PaperShapeFactory {
  _createRectangle(shape) {
    return new PaperRectangle(shape.id, shape.labeledThingInFrameId, shape.topLeft, shape.bottomRight, 'red');
  }

  createPaperShape(shape) {
    switch (shape.type) {
      case 'rectangle':
        return this._createRectangle(shape);
      default:
        throw new Error(`Failed to construct shape of unknown type ${shape.type}.`);
    }
  }
}

export default PaperShapeFactory;
