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
    this._counters = {};

    Object.keys(this._colorPalettes).forEach(paletteName => {
      this._counters[paletteName] = 0;
    });
  }

  /**
   * Selects a color from the given color palette
   *
   * @param {String} [colorPalette]
   * @returns {String}
   */
  getColor(colorPalette = 'primary') {
    const colors = this._colorPalettes[colorPalette];

    if (!colors) {
      throw new Error(`Unknown color palette ${colorPalette}`);
    }

    return colors[this._counters[colorPalette]++ % colors.length];
  }
}

EntityColorService.$inject = ['applicationConfig'];

export default EntityColorService;
