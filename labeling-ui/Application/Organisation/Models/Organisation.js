import OrganisationDiskUsage from './OrganisationDiskUsage';

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

    /**
     * @type {number}
     */
    this.numberOfProjects = organisationDocument.numberOfProjects;

    /**
     * @type {number}
     */
    this.numberOfVideos = organisationDocument.numberOfVideos;

    /**
     * @type {OrganisationDiskUsage}
     */
    this.diskUsage = new OrganisationDiskUsage(organisationDocument.diskUsage);
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
