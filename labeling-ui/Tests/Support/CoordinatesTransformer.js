/**
 * Simple helper to transform between viewer and real video coordinates
 */
class CoordinatesTransformer {
  /**
   * @param {{width: Integer, height: Integer}} videoDimensions
   * @param {{width: Integer, height: Integer}} viewerDimensions
   */
  constructor(videoDimensions = null, viewerDimensions = null) {
    this.videoDimensions = videoDimensions;
    this.viewerDimensions = viewerDimensions;
  }

  /**
   * @param {{width: Integer, height: Integer}} videoDimensions
   */
  setVideoDimensions(videoDimensions) {
    this.videoDimensions = videoDimensions;
  }

  /**
   * @param {{width: Integer, height: Integer}} viewerDimensions
   */
  setViewerDimensions(viewerDimensions) {
    this.viewerDimensions = viewerDimensions;
  }

  /**
   * Try and set the viewer dimensions automatically by accessing the `.layer-container` css element
   *
   * @returns {Promise.<{viewer: Element, viewerSize: {width: Integer, height: Integer}}>}
   */
  autoSetViewerDimensions() {
    const viewer = element(by.css('.layer-container'));
    return viewer.getSize()
      .then(viewerSize => {
        this.setViewerDimensions(viewerSize);
        return {viewer, viewerSize};
      });
  }

  /**
   * @param {Integer} x
   * @param {Integer} y
   * @returns {{x: number, y: number}}
   */
  toViewer(x, y) {
    this._ensureDimensionsAvailable();

    const xFactor = this.viewerDimensions.width / this.videoDimensions.width;
    const yFactor = this.viewerDimensions.height / this.videoDimensions.height;
    return {x: Math.round(x * xFactor), y: Math.round(y * yFactor)};
  }

  /**
   * @param {Integer} x
   * @param {Integer} y
   * @returns {{x: number, y: number}}
   */
  toVideo(x, y) {
    this._ensureDimensionsAvailable();

    const xFactor = this.videoDimensions.width / this.viewerDimensions.width;
    const yFactor = this.videoDimensions.height / this.viewerDimensions.height;
    return {x: Math.round(x * xFactor), y: Math.round(y * yFactor)};
  }

  /**
   * Ensure `videoDimensions` as well as `viewerDimensions` are available throw otherwise
   *
   * @private
   */
  _ensureDimensionsAvailable() {
    if (this.videoDimensions === null || this.viewerDimensions === null) {
      throw new Error('videoDimensions as well as viewerDimensions need to be set in order for coordinates to be transformed.');
    }
  }
}

export default CoordinatesTransformer;
