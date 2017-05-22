import fs from 'fs';
import path from 'path';

class AssetHelper {
  /**
   * @param {string} fixturePath
   * @param {string} mockPath
   */
  constructor(fixturePath, mockPath) {
    /**
     * @type {string}
     * @private
     */
    this._fixturePath = fixturePath;

    /**
     * @type {string}
     * @private
     */
    this._mockPath = mockPath;

    /**
     * @type {Object|null}
     * @private
     */
    this._fixtureStructure = null;

    /**
     * @type {Object|null}
     * @private
     */
    this._mockStructure = null;
  }

  /**
   * @param {string} pathName
   * @param {string} suffix
   * @returns {Object}
   * @private
   */
  _loadDirStructure(pathName, suffix) {
    const structure = {};
    const files = fs.readdirSync(pathName);

    files.forEach(file => {
      const filePath = path.resolve(`${pathName}/${file}`);
      const stats = fs.statSync(filePath);
      const key = path.basename(file, suffix).replace(/[^a-zA-Z0-9_]/g, '_');

      if (stats.isDirectory()) {
        structure[key] = this._loadDirStructure(filePath, suffix);
      } else if (path.extname(filePath) === suffix) {
        try {
          structure[key] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
          throw new Error(`Error loading asset "${filePath}": ${error.message}`);
        }
      }
    });


    return structure;
  }

  /**
   * @returns {Object}
   */
  get fixtures() {
    if (AssetHelper.FIXTURE_STRUCTURE[this._fixturePath] === undefined) {
      AssetHelper.FIXTURE_STRUCTURE[this._fixturePath] = this._loadDirStructure(this._fixturePath, '.json');
    }

    return AssetHelper.FIXTURE_STRUCTURE[this._fixturePath];
  }

  /**
   * @returns {Object}
   */
  get mocks() {
    if (AssetHelper.MOCK_STRUCTURE[this._mockPath] === undefined) {
      const mockStructure = this._loadDirStructure(this._mockPath, '.json');
      AssetHelper.MOCK_STRUCTURE[this._mockPath] = JSON.stringify(mockStructure);
    }
    // Make sure that always a copy is returned
    return JSON.parse(AssetHelper.MOCK_STRUCTURE[this._mockPath]);
  }
}

AssetHelper.FIXTURE_STRUCTURE = {};
AssetHelper.MOCK_STRUCTURE = {};

export default AssetHelper;