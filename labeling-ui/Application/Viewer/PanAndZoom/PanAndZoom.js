import paper from 'paper';

/**
 * Helper class providing zooming and panning algorithms for PaperJs views
 */
class PanAndZoom {
  /**
   * @param {paper.View} view
   * @param {Number} zoomFactor
   */
  constructor(view, zoomFactor = 1.05) {
    /**
     * @type {paper.View}
     */
    this.view = view;

    /**
     * @type {Number}
     */
    this.zoomFactor = zoomFactor;
  }

  /**
   * Adjust the view's zoom while keeping the given focal point stable
   *
   * @param {Number} deltaY
   * @param {Point} focalPoint
   */
  changeZoom(deltaY, focalPoint) {
    const localFocalPoint = this.view.viewToProject(focalPoint);
    let newZoom = this.view.zoom;

    if (deltaY < 0) {
      newZoom *= this.zoomFactor;
    } else if (deltaY > 0) {
      newZoom /= this.zoomFactor;
    }

    newZoom = Math.max(newZoom, 1);

    const deltaZoom = this.view.zoom / newZoom;

    const deltaCenter = localFocalPoint.subtract(this.view.center);
    const centerTranslation = localFocalPoint.subtract(deltaCenter.multiply(deltaZoom)).subtract(this.view.center);

    let newCenter = this.view.center.add(centerTranslation);

    newCenter = this._restrictViewportToViewBounds(newCenter);

    this.view.zoom = newZoom;
    this.view.center = newCenter;
  }

  /**
   * Adjust the views center by the given deltas in x and y direction, panning the view
   *
   * @param deltaX
   * @param deltaY
   */
  changeCenter(deltaX, deltaY) {
    let offset = (new paper.Point(deltaX, deltaY));

    // Account for view to client pixel ratio when zoomed
    offset = offset.divide(this.view.zoom);

    this.view.center = this._restrictViewportToViewBounds(this.view.center.add(offset));
  }

  /**
   * Ensure the viewport cannot be moved out of bounds
   *
   * @param {paper.Point} newCenter
   *
   * @returns {paper.Point}
   *
   * @private
   */
  _restrictViewportToViewBounds(newCenter) {
    const width = this.view.bounds.width;
    const height = this.view.bounds.height;

    const unscaledViewWidth = this.view.viewSize.getWidth();
    const unscaledViewHeight = this.view.viewSize.getHeight();

    let correctedX = newCenter.x;
    let correctedY = newCenter.y;

    if (newCenter.x - width / 2 < 0 || newCenter.x + width / 2 > unscaledViewWidth) {
      correctedX = width / 2;
    }

    if (newCenter.y - height / 2 < 0 || newCenter.y + height / 2 > unscaledViewHeight) {
      correctedY = height / 2;
    }

    return new paper.Point(correctedX, correctedY);
  }
}

export default PanAndZoom;
