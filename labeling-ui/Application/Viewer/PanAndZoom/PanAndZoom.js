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
   * @param {Number} newZoom
   * @param {Point} focalPoint
   */
  zoom(newZoom, focalPoint) {
    const localFocalPoint = this.view.viewToProject(focalPoint);
    const deltaZoom = this.view.zoom / newZoom;

    const deltaCenter = localFocalPoint.subtract(this.view.center);
    const centerTranslation = localFocalPoint.subtract(deltaCenter.multiply(deltaZoom)).subtract(this.view.center);

    let newCenter = this.view.center.add(centerTranslation);

    newCenter = this._restrictViewportToViewBounds(newCenter);

    this.view.zoom = newZoom;
    this.view.center = newCenter;
  }

  /**
   * Zoom the view in by the given amount of ticks
   *
   * @param {Point} focalPoint
   * @param {Number} [ticks]
   */
  zoomIn(focalPoint, ticks = 1) {
    const newZoom = Math.max(this.view.zoom * this.zoomFactor * ticks, 1);

    this.zoom(newZoom, focalPoint);
  }

  /**
   * Zoom the view out by the given amount of ticks
   *
   * @param {Point} focalPoint
   * @param {Number} [ticks]
   */
  zoomOut(focalPoint, ticks = 1) {
    const newZoom = Math.max(this.view.zoom / this.zoomFactor / ticks, 1);

    this.zoom(newZoom, focalPoint);
  }

  /**
   * Adjust the views center by the given deltas in x and y direction, panning the view
   *
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  changeCenter(deltaX, deltaY) {
    let offset = new paper.Point(deltaX, deltaY);

    // Account for view to client pixel ratio when zoomed
    offset = offset.divide(this.view.zoom);

    this.setCenter(this.view.center.add(offset));
  }

  /**
   * Center the view on the given point. View bounds restrictions are enforced.
   *
   * @param {Point} newCenter
   */
  setCenter(newCenter) {
    this.view.center = this._restrictViewportToViewBounds(newCenter);
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
