import paper from 'paper';

import PaperLayer from './PaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import RectangleModificationTool from '../Tools/RectangleModificationTool';
import RectangleRenderer from '../Renderer/RectangleRenderer';

/**
 * A Layer used to draw labeling annotations within the viewer
 *
 * @class AnnotationLayer
 */
export default class AnnotationLayer extends PaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super(drawingContextService);

    /**
     * Renderer used by this layer to draw labeling rectangles loaded from the backend
     *
     * @type {RectangleRenderer}
     * @private
     */
    this._rectangleRenderer = new RectangleRenderer();

    /**
     * Storage used to manage the currently displayed annotations
     *
     * @type {Map}
     * @private
     */
    this._annotations = new Map();

    /**
     * Tool for moving and resizing rectangles
     *
     * @type {RectangleModificationTool}
     * @private
     */
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

    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
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

      // TODO use item-INdependent id since this won't work with multiple shapes per LabeledThingInFrame
      this.setAnnotation(rectangle.id, annotation);

      this.emit('annotation:new', rectangle.id, annotation);
    });
  }

  /**
   * Activates the tool identified by the given name
   *
   * @method AnnotationLayer#activateTool
   *
   * @param {String} toolName
   */
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
   * Adds the given annotations to this layer and draws their respective shapes
   *
   * @method AnnotationLayer#addAnnotations
   *
   * @param {LabeledThingInFrame[]} annotations
   */
  addAnnotations(annotations) {
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

  /**
   * Removes all annotations from the layer
   *
   * @method AnnotationLayer#clear
   */
  clear() {
    super.clear();
    this._annotations.clear();
  }

  /**
   * @param {String} annotationId - The annotation id used internally by this layer
   * @param {LabeledThingInFrame} annotation
   */
  setAnnotation(annotationId, annotation) {
    this._annotations.set(annotationId, annotation);
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}
