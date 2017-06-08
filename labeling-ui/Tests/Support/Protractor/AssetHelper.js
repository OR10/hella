import fs from 'fs';
import path from 'path';
import {cloneDeep} from 'lodash';

class AssetHelper {
  /**
   * @param {string} fixturePath
   * @param {string} mockPath
   */
  constructor(fixturePath, mockPath, documentPath = null) {
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
     * @type {string|null}
     * @private
     */
    this._documentPath = documentPath;

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

    /**
     * @type {Object|null}
     * @private
     */
    this._documentStructure = null;
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
    // Make sure that always a copy is returned
    return cloneDeep(AssetHelper.FIXTURE_STRUCTURE[this._fixturePath]);
  }

  /**
   * @returns {Object}
   */
  get mocks() {
    if (AssetHelper.MOCK_STRUCTURE[this._mockPath] === undefined) {
      AssetHelper.MOCK_STRUCTURE[this._mockPath] = this._loadDirStructure(this._mockPath, '.json');
    }
    // Make sure that always a copy is returned
    return cloneDeep(AssetHelper.MOCK_STRUCTURE[this._mockPath]);
  }

  /**
   * @return {Object}
   */
  get documents() {
    if (AssetHelper.DOCUMENT_STRUCTURE[this._documentPath] === undefined) {
      AssetHelper.DOCUMENT_STRUCTURE[this._documentPath] = this._loadDirStructure(this._documentPath, '.json');
    }
    // Make sure that always a copy is returned
    return cloneDeep(AssetHelper.DOCUMENT_STRUCTURE[this._documentPath]);
  }
}

AssetHelper.FIXTURE_STRUCTURE = {};
AssetHelper.MOCK_STRUCTURE = {};
AssetHelper.DOCUMENT_STRUCTURE = {};

export default AssetHelper;
