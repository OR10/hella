class OrganisationSelectController {
  /**
   * @param {Array.<Organisation>} organisations
   */
  constructor(organisations) {
    /**
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = organisations;
  }
}

OrganisationSelectController.$inject = [
  'organisations'
];

export default OrganisationSelectController;