import paper from 'paper';

import PaperLayer from './PaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import RectangleModificationTool from '../Tools/RectangleModificationTool';
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

    this._annotations = new Map();

    this._rectangleModificationTool = new RectangleModificationTool(this._context);

    this._rectangleModificationTool.on('rectangle:update', (rectangle) => {
      const annotation = this._annotations.get(rectangle.id);

      annotation.shapes = [
        {
          type: 'rectangle',
          id: rectangle.id,
          topLeft: {
            x: rectangle.bounds.topLeft.x,
            y: rectangle.bounds.topLeft.y,
          },
          bottomRight: {
            x: rectangle.bounds.bottomRight.x,
            y: rectangle.bounds.bottomRight.y,
          },
        },
      ];

      this.emit('annotation:update', rectangle.id, annotation);
    });

    this._rectangleDrawingTool = new RectangleDrawingTool(this._context);

    this._rectangleDrawingTool.on('rectangle:complete', (rectangle) => {
      const annotation = {
        shapes: [
          {
            type: 'rectangle',
            id: rectangle.id,
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
      };

      // TODO use item-idependent id since this won't work with multiple shapes per LabeledThingInFrame
      this.setAnnotation(rectangle.id, annotation);

      this.emit('annotation:new', rectangle.id, annotation);
    });
  }

  activateTool(toolName) {
    switch (toolName) {
      case 'drawing':
        this._rectangleDrawingTool.activate();
        break;
      default:
        this._rectangleModificationTool.activate();
    }
  }

  /**
   * @method AnnotationLayer#setAnnotations
   *
   * @param annotations
   */
  setAnnotations(annotations) {
    this._context.withScope((scope) => {
      annotations.forEach((annotation) => {
        const shape = annotation.shapes[0];
        const rect = this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, {
          strokeColor: 'red',
          strokeWidth: 2,
          fillColor: new paper.Color(0, 0, 0, 0),
        });

        this._annotations.set(rect.id, annotation);
      });

      scope.view.update();
    });
  }

  setAnnotation(annotationId, annotation) {
    this._annotations.set(annotationId, annotation);
  }

  renderInPaperScope(scope) {
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
