/**
 * A Service providing colors for entities
 */
class EntityColorService {
  /**
   * @param {Object} applicationConfig
   */
  constructor(applicationConfig) {
    /**
     * @type {Object<String, String>}
     */
    this._colorPalettes = applicationConfig.Common.colorPalettes;

    /**
     * @type {number}
     * @private
     */
    this._counter = 0;
  }

  /**
   * Selects a new color
   *
   * Note that the returned color is not guaranteed to be unique.
   *
   * @returns {String}
   */
  getColorId() {
    const colors = this._colorPalettes.primary;

    const colorIds = Object.keys(colors);

    return colorIds[this._counter++ % colorIds.length];
  }

  /**
   * Retrieves the matching color for the given id from the given color palette.
   *
   * @param {string} colorId
   * @returns {{primary: string, secondary: string}}
   */
  getColorById(colorId) {
    const palettes = this._colorPalettes;

    const color = {primary: palettes.primary[colorId], secondary: palettes.secondary[colorId]};

    if (!color) {
      throw new Error(`Unknown color with id ${colorId}`);
    }

    return color;
  }
}

EntityColorService.$inject = ['applicationConfig'];

export default EntityColorService;
