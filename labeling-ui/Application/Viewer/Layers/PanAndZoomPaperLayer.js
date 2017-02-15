import PaperLayer from './PaperLayer';
import PanAndZoom from '../PanAndZoom/PanAndZoom';

/**
 * Special PaperLayer which provides basic pan and zoom functionality
 *
 * @extends PaperLayer
 */
class PanAndZoomPaperLayer extends PaperLayer {
  /**
   * @param {int} width
   * @param {int} height
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   */
  constructor(width, height, $scope, drawingContext) {
    super(width, height, $scope, drawingContext);
  }

  attachToDom(element) {
    super.attachToDom(element);

    this._panAndZoom = new PanAndZoom(this._context);
  }

  setZoom(zoom, focalPoint = null) {
    this._panAndZoom.zoom(zoom, focalPoint);
  }

  /**
   * @param {Point} focalPoint
   * @param {Number} [zoomFactor]
   */
  zoomOut(focalPoint, zoomFactor = 1.05) {
    const newZoom = Math.max(this.zoom / zoomFactor, this._scaleToFitZoom);

    this._panAndZoom.zoom(newZoom, focalPoint);
  }

  /**
   * Zoom the view in on the given point
   */
  zoomIn(focalPoint, zoomFactor) {
    const newZoom = this.zoom * zoomFactor;

    this._panAndZoom.zoom(newZoom, focalPoint);
  }

  resize(width, height) {
    super.resize(width, height);

    this._panAndZoom.setScaleToFitZoom(this._scaleToFitZoom);
  }

  /**
   * Pan the view by the given offsets
   *
   * @param deltaX
   * @param deltaY
   */
  panBy(deltaX, deltaY) {
    this._panAndZoom.panBy(deltaX, deltaY);
  }

  panTo(newCenter) {
    this._panAndZoom.panTo(newCenter);
  }
}

export default PanAndZoomPaperLayer;
