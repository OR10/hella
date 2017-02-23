/**
 * Service providing access to the currently active logged in user and all its related information.
 */
class CurrentUserService {
  constructor() {
    /**
     * @type {User|null}
     * @private
     */
    this._user = null;

    /**
     * @type {Object|null}
     * @private
     */
    this._permissions = null;

    /**
     * @type {Array.<Organisation>|null}
     * @private
     */
    this._organisations = null;
  }

  /**
   * @param {User} user
   */
  set(user) {
    this._user = user;
  }

  /**
   * @param {Object} permissions
   */
  setPermissions(permissions) {
    this._permissions = permissions;
  }

  /**
   * @param {Array.<Organisation>} organisations
   */
  setOrganisations(organisations) {
    this._organisations = organisations;
  }

  /**
   * @returns {User}
   */
  get() {
    if (this._user === null) {
      throw new Error('User retrieved before being set!');
    }

    return this._user;
  }

  /**
   * @returns {Object}
   */
  getPermissions() {
    if (this._permissions === null) {
      throw new Error('User permissions retrieved before being set!');
    }

    return this._permissions;
  }

  /**
   * @returns {Array.<Organisations>}
   */
  getOrganisations() {
    if (this._organisations === null) {
      throw new Error('User organisations retrieved before being set!');
    }

    return this._organisations;
  }
}

export default CurrentUserService;
