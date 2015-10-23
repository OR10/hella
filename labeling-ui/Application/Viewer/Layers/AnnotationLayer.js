import paper from 'paper';

/**
 * @class AnnotationLayer
 * @implements {Layer}
 */
export default class AnnotationLayer {
  constructor() {
    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._element = null;

    /**
     * @type {paper.PaperScope}
     * @private
     */
    this._paperScope = new paper.PaperScope();
  }

  render() {
    this._paperScope.view.draw();
  }

  attachToDom(element) {
    this._element = element;
    this._paperScope.setup(this._element);
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
