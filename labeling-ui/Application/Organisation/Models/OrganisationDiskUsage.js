class OrganisationDiskUsage {
  /**
   * @param {Object} diskUsageDocument
   */
  constructor(diskUsageDocument) {
    /**
     * @type {string}
     */
    this.total = diskUsageDocument.total;

    /**
     * @type {number}
     */
    this.videos = diskUsageDocument.videos;

    /**
     * @type {Object}
     */
    this.imgages = diskUsageDocument.images;
  }

  /**
   * @return {{total: number, videos: number, images: Object}}
   */
  toJSON() {
    const {total, videos, images} = this;

    return {
      total,
      videos,
      images,
    };
  }
}

export default OrganisationDiskUsage;
