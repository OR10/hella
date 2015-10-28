import paper from 'paper';

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
            type: 'rectangle',
            topLeft: {
              x: rectangle.bounds.topLeft.x,
              y: rectangle.bounds.topLeft.y,
            },
            bottomRight: {
              x: rectangle.bounds.bottomRight.x,
              y: rectangle.bounds.bottomRight.y,
            },
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

  renderInPaperScope(scope) {
    this._annotations.forEach((annotation) => {
      const shape = annotation.shapes[0];
      this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, {
        strokeColor: 'red',
        strokeWidth: 2,
        fillColor: new paper.Color(0, 0, 0, 0),
      });
    });

    scope.view.update();
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
