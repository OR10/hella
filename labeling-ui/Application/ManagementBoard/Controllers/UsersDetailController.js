class UsersDetailController {
  /**
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   */
  constructor($stateParams, user, userPermissions) {
    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {string}
     */
    this.userId = $stateParams.userId;
  }
}

UsersDetailController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersDetailController;
