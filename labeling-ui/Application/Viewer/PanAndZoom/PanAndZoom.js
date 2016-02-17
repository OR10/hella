import paper from 'paper';

/**
 * Helper class providing zooming and panning algorithms for PaperJs views
 */
class PanAndZoom {
  /**
   * @param {paper.View} view
   */
  constructor(context) {
    /**
     * @type {paper.View}
     */
    this._context = context;

    /**
     * Initial Zoom value used for scaled-to-fit zooming
     *
     * @type {number}
     * @private
     */
    this._scaleToFitZoom = 1;
  }

  /**
   * @param {Number} zoom
   */
  setScaleToFitZoom(zoom) {
    this._scaleToFitZoom = zoom;
  }

  /**
   * Adjust the view's zoom while keeping the given focal point stable
   *
   * @param {Number} newZoom
   * @param {Point} [focalPoint]
   */
  zoom(newZoom, focalPoint = null) {
    this._context.withScope((scope) => {

      const view = scope.view;

      let newCenter = view.center;

      if (focalPoint !== null) {
        const localFocalPoint = view.viewToProject(focalPoint);
        const deltaZoom = view.zoom / newZoom;

        const deltaCenter = localFocalPoint.subtract(view.center);
        const centerTranslation = localFocalPoint.subtract(deltaCenter.multiply(deltaZoom)).subtract(view.center);

        newCenter = view.center.add(centerTranslation);
      }

      view.zoom = newZoom;
      view.center = this._restrictViewportToViewBounds(view, newCenter);

    });
  }

  /**
   * Adjust the views center by the given deltas in x and y direction, panning the view
   *
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  panBy(deltaX, deltaY) {
    this._context.withScope((scope) => {
      const view = scope.view;
      let offset = new paper.Point(deltaX, deltaY);

      // Account for view to client pixel ratio when zoomed
      offset = offset.divide(view.zoom);

      this.panTo(view.center.add(offset));
    });
  }

  /**
   * Center the view on the given point. View bounds restrictions are enforced.
   *
   * @param {Point} newCenter
   */
  panTo(newCenter) {
    this._context.withScope((scope) => {
      scope.view.center = this._restrictViewportToViewBounds(scope.view, newCenter);
    });
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
  _restrictViewportToViewBounds(view, newCenter) {
    const width = view.bounds.width;
    const height = view.bounds.height;

    const unscaledViewWidth = view.viewSize.width / this._scaleToFitZoom;
    const unscaledViewHeight = view.viewSize.height / this._scaleToFitZoom;

    let correctedX = newCenter.x;
    let correctedY = newCenter.y;

    if (newCenter.x - view.bounds.width / 2 < 0) {
      correctedX = view.bounds.width / 2;
    }

    if (newCenter.y - view.bounds.height / 2 < 0) {
      correctedY = view.bounds.height / 2;
    }

    if (newCenter.x + view.bounds.width / 2 > unscaledViewWidth) {
      correctedX = unscaledViewWidth - width / 2;
    }

    if (newCenter.y + view.bounds.height / 2 > unscaledViewHeight) {
      correctedY = unscaledViewHeight - height / 2;
    }

    return new paper.Point(correctedX, correctedY);
  }
}

export default PanAndZoom;
