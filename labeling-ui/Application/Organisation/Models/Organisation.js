class Organisation {
  /**
   * @param {Object} organisationDocument
   */
  constructor(organisationDocument) {
    /**
     * @type {string}
     */
    this.id = organisationDocument.id;

    /**
     * @type {string}
     */
    this.name = organisationDocument.name;

    /**
     * @type {number|null}
     */
    this.quota = organisationDocument.quota;
  }

  /**
   * @returns {{id: string, name: string, quota: number|null}}
   */
  toJSON() {
    const {id, name, quota} = this;

    return {
      id,
      name,
      quota,
    };
  }
}

export default Organisation;
