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
    this._counter = Math.round(Math.random() * Object.keys(this._colorPalettes.primary).length);
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
   * @param {string} colorPalette
   * @returns {string}
   */
  getColorById(colorId, colorPalette = 'primary') {
    const colors = this._colorPalettes[colorPalette];

    if (!colors) {
      throw new Error(`Unknown color palette ${colorPalette}`);
    }

    const color = colors[colorId];

    if (!color) {
      throw new Error(`Unknown color with id ${colorId} in palette ${colorPalette}`);
    }

    return color;
  }
}

EntityColorService.$inject = ['applicationConfig'];

export default EntityColorService;
