import paper from 'paper';
import RectangleShape from './RectangleShape';

class ShapeFactory {
  constructor() {

  }

  /**
   * Evil hack to extend paper class, which otherwise does not work properly
   * We are essentially destroying the prototype chain here, but I don't see another way for now.
   * (Only other way would be using __proto__ which is not supported by older IEs :()
   *
   * @param paperShape
   * @param ourShape
   * @returns {path}
   * @private
   */
  _bendInheritanceModel(paperShape, ourShape) {
    const newInstance = Object.create(paperShape);
    Object.getOwnPropertyNames(ourShape.constructor.prototype).forEach(property => {
      if (property === 'constructor') {
        return;
      }

      newInstance[property] = ourShape.constructor.prototype[property];
    });

    Object.getOwnPropertyNames(ourShape).forEach(property => {
      newInstance[property] = ourShape[property];
    });

    return newInstance;
  }

  createRectangle(shape, shapeFillOptions) {
    const params = Object.assign({}, shapeFillOptions, {from: shape.topLeft, to: shape.bottomRight});

    const paperRectangle = new paper.Path.Rectangle(params);
    const rectangle = new RectangleShape();

    return this._bendInheritanceModel(paperRectangle, rectangle);
  }
}

export default ShapeFactory;
