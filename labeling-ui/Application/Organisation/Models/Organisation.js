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
    this.rev = organisationDocument.rev ? organisationDocument.rev : null;

    /**
     * @type {string}
     */
    this.name = organisationDocument.name;

    /**
     * @type {number|null}
     */
    this.quota = organisationDocument.quota;

    /**
     * @type {number|null}
     */
    this.userQuota = organisationDocument.userQuota;

    /**
     * @type {number}
     */
    this.numberOfProjects = organisationDocument.numberOfProjects;

    /**
     * @type {number}
     */
    this.numberOfVideos = organisationDocument.numberOfVideos;

    /**
     * @type {OrganisationDiskUsage | null}
     */
    this.diskUsage = organisationDocument.diskUsage ? new OrganisationDiskUsage(organisationDocument.diskUsage) : null;
  }

  /**
   * @returns {{id: string, name: string, quota: number|null}}
   */
  toJSON() {
    const {id, rev, name, quota, userQuota} = this;

    return {
      id,
      rev,
      name,
      quota,
      userQuota,
    };
  }
}

export default Organisation;
