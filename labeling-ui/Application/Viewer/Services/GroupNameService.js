class GroupNameService {
  constructor() {
    /**
     * @type {Map.<string, number>}
     * @private
     */
    this._groupIdNameMapping = new Map();

    /**
     * @type {number}
     * @private
     */
    this._counter = 1;
  }

  /**
   * Returns a unique name for any given shape id
   *
   * @param {string} groupId
   * @return {number}
   */
  getNameById(groupId) {
    if (!this._groupIdNameMapping.has(groupId)) {
      this._groupIdNameMapping.set(groupId, this._counter);
      this._counter++;
    }

    return this._groupIdNameMapping.get(groupId);
  }
}

GroupNameService.$inject = [];

export default GroupNameService;
