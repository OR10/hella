import PaperLayer from './PaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import RectangleRenderer from '../Renderer/RectangleRenderer';

/**
 * @class AnnotationLayer
 */
export default class AnnotationLayer extends PaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super(drawingContextService);

    this._rectangleRenderer = new RectangleRenderer();

    this._annotations = [];

    this._rectangleDrawingTool = new RectangleDrawingTool(this._context);

    this._rectangleDrawingTool.on('rectangle:complete', (rectangle) => {
      this._annotations.push({
        shapes: [
          {
            topLeft: rectangle.bounds.topLeft,
            bottomRight: rectangle.bounds.bottomRight,
          },
        ],
      });
    });
  }

  setAnnotations(annotations) {
    this._annotations = annotations;
  }

  getAnnotations() {
    return this._annotations;
  }

  renderInPaperScope() {

  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
