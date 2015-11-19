import Paper from 'paper';

class PaperRectangle {
  /**
   * @param {Rectangle} shape
   * @param {Object} shapeFillOptions
   */
  constructor(shape, shapeFillOptions) {
    const params = Object.assign({}, shapeFillOptions, {from: shape.topLeft, to: shape.bottomRight});

    // Evil hack to extend paper class, which otherwise does not work properly
    // We are essentially destroying the prototype chain here, but I don't see another way for now.
    // (Only other way would be using __proto__ which is not supported by older IEs :()
    const path = new Paper.Path.Rectangle(params);
    const newInstance = Object.create(path);
    Object.getOwnPropertyNames(this.constructor.prototype).forEach(property => {
      if (property === 'constructor') {
        return;
      }

      newInstance[property] = this.constructor.prototype[property];
    });
  }
}

export default PaperRectangle;
