import paper from 'paper';
import PaperLayer from './PaperLayer';
import RectangleTool from '../Tools/RectangleTool';

/**
 * @class AnnotationLayer
 */
export default class AnnotationLayer extends PaperLayer {
  /**
   * @param {PaperScopeService} paperScopeService
   */
  constructor(paperScopeService) {
    super(paperScopeService);

    this._rectangleTool = null;
  }

  _initializeComponents() {
    this._rectangleTool = new RectangleTool();
  }

  _render() {

  }

  _dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
