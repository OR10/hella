import paper from 'paper';

/**
 * Helper class providing zooming and panning algorithms for PaperJs views
 */
class PanAndZoom {
  /**
   * @param {paper.View} view
   */
  constructor(view) {
    /**
     * @type {paper.View}
     */
    this.view = view;
  }

  /**
   * Adjust the view's zoom while keeping the given focal point stable
   *
   * @param {Number} newZoom
   * @param {Point} [focalPoint]
   */
  zoom(newZoom, focalPoint = null) {
    let newCenter = this.view.center;

    if (focalPoint !== null) {
      const localFocalPoint = this.view.viewToProject(focalPoint);
      const deltaZoom = this.view.zoom / newZoom;

      const deltaCenter = localFocalPoint.subtract(this.view.center);
      const centerTranslation = localFocalPoint.subtract(deltaCenter.multiply(deltaZoom)).subtract(this.view.center);

      newCenter = this.view.center.add(centerTranslation);
    }

    this.view.zoom = newZoom;
    this.view.center = this._restrictViewportToViewBounds(newCenter);
  }

  /**
   * Adjust the views center by the given deltas in x and y direction, panning the view
   *
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  panBy(deltaX, deltaY) {
    let offset = new paper.Point(deltaX, deltaY);

    // Account for view to client pixel ratio when zoomed
    offset = offset.divide(this.view.zoom);

    this.panTo(this.view.center.add(offset));
  }

  /**
   * Center the view on the given point. View bounds restrictions are enforced.
   *
   * @param {Point} newCenter
   */
  panTo(newCenter) {
    console.log(this.view.bounds.center);
    this.view.center = this._restrictViewportToViewBounds(newCenter);
    console.log(this.view.bounds.center);
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

    if (this.view.bounds.topLeft.x < 0) {
      correctedX = this.view.bounds.width / 2;
    }

    if (this.view.bounds.topLeft.y < 0) {
      correctedY = this.view.bounds.height / 2;
    }

    if (this.view.bounds.bottomRight.x > unscaledViewWidth) {
      correctedX = unscaledViewWidth - width / 2;
    }

    if (this.view.bounds.bottomRight.y > unscaledViewHeight) {
      correctedY = unscaledViewHeight - height / 2;
    }

    //console.log('==========');
    //console.log(width, height);
    //console.log(this.view.size.width, this.view.size.height)
    //console.log(unscaledViewWidth, unscaledViewHeight);
    //console.log(width / unscaledViewWidth);
    //console.log(this.view.bounds.width);
    //console.log(this.view.viewSize.width);
    //console.log(this.view.size.width);
    //console.log(this.view.bounds.topLeft.x, this.view.bounds.topLeft.y, this.view.bounds.bottomRight.x, this.view.bounds.bottomRight.y)
    //console.log(correctedX, correctedY);
    //console.log(this.view.center.x, this.view.center.y);
    //console.log('==========');

    return newCenter;
    //return new paper.Point(correctedX, correctedY);
  }
}

export default PanAndZoom;
