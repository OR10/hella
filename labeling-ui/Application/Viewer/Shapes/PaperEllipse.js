import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @class PaperEllipse
 * @extends PaperShape
 */
class PaperEllipse extends PaperShape {
  constructor(shapeId, labeledThingInFrameId, center, size, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._shape = new paper.Path.Ellipse({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      size,
      center,
    });

    this.addChild(this._shape);
  }

  toJSON() {
    const {size, center} = this._shape;

    return {
      type: 'ellipse',
      id: this._shapeId,
      center: {x: center.x, y: center.y},
      size: {width: size.width, height: size.height},
      labeledThingInFrameId: this.labeledThingInFrameId,
    };
  }

  scale() {
    this._shape.scale.apply(this, arguments);
  }
}

export default PaperEllipse;
