class Organisation {
  /**
   * @param {string} id
   * @param {string} name
   * @param {number|null} quota
   */
  constructor(id, name, quota) {
    /**
     * @type {string}
     */
    this.id = id;

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {number|null}
     */
    this.quota = quota;
  }

  /**
   * @returns {{id: string, name: string, quota: number|null}}
   */
  toJSON() {
    const {id, name, quota} = this;

    return {
      id,
      name,
      quota
    };
  }
}

export default Organisation;