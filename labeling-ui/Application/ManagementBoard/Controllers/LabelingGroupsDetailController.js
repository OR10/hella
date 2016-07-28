import LabelingGroup from '../Models/LabelingGroup';

/**
 * Route Controller for specific labeling group
 */
class LabelingGroupsDetailController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {LabelingGroupGateway} labelingGroupGateway
   * @param {UserGateway} userGateway
   */
  constructor($scope, $stateParams, $state, user, userPermissions, labelingGroupGateway, userGateway) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$stateParams}
     * @private
     */
    this._$stateParams = $stateParams;

    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {boolean}
     */
    this.createMode = ($stateParams.groupId === 'new');

    /**
     * @type {number}
     */
    this.loadingInProgress = 0;

    /**
     * @type {LabelingGroupGateway}
     * @private
     */
    this._labelingGroupGateway = labelingGroupGateway;

    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;

    /**
     * @type {null|LabelingGroup}
     */
    this.group = null;

    /**
     * @type {null|string}
     */
    this.groupCoordinatorId = null;

    /**
     * @type {Array.<User>}
     */
    this.groupLabelers = [];

    /**
     * @type {Array.<User>}
     */
    this.users = [];

    /**
     * @type {Array.<User>}
     */
    this.possibleCoordinators = [];

    /**
     * @type {Array.<User>}
     */
    this.possibleLabelers = [];

    /**
     * @type {{coordinator: boolean, labelers: boolean}}
     */
    this.validation = {
      coordinator: true,
      labelers: true,
    };

    if (!this.createMode) {
      this._loadGroup();
    }

    this._loadAllUsers();
  }

  addLabeler(id) {
    const user = this.users.find(user => user.id === id);
    if (this.groupLabelers.includes(user)) {
      return;
    }

    this.groupLabelers.push(user);
  }

  removeLabeler(id) {
    this.groupLabelers.splice(
      this.groupLabelers.findIndex(user => user.id === id)
    );
  }

  saveGroup() {
    if (this._validateGroup() !== true) {
      return;
    }

    if (this.createMode === true) {
      this._createGroup();
    } else {
      this._updateGroup();
    }

    this._$state.go('labeling.labeling-groups.list');
  }

  cancelEdit() {
    this._$state.go('labeling.labeling-groups.list');
  }

  deleteGroup(id) {
    ++this.loadingInProgress;
    this._labelingGroupGateway.deleteLabelingGroup(id)
      .then(() => --this.loadingInProgress);

    this._$state.go('labeling.labeling-groups.list');
  }

  _updateGroup() {
    ++this.loadingInProgress;
    this._labelingGroupGateway.updateLabelingGroup(
      new LabelingGroup({
        id: this.group.id,
        coordinators: [this.groupCoordinatorId],
        labelers: this.groupLabelers.map(labeler => labeler.id),
      })
    ).then(() => --this.loadingInProgress);
  }

  _createGroup() {
    ++this.loadingInProgress;
    this._labelingGroupGateway.createLabelingGroup(
      new LabelingGroup({
        coordinators: [this.groupCoordinatorId],
        labelers: this.groupLabelers.map(labeler => labeler.id),
      })
    ).then(() => --this.loadingInProgress);
  }

  /**
   * Validates the group input
   *
   * @private
   */
  _validateGroup() {
    let valid = true;

    this.validation.coordinator = true;
    this.validation.labelers = true;

    if (this.groupCoordinatorId === null && this.groupCoordinatorId === undefined) {
      this.validation.coordinator = valid = false;
    }

    if (this.groupLabelers.length === 0) {
      this.validation.labelers = valid = false;
    }

    return valid;
  }

  _loadGroup() {
    ++this.loadingInProgress;
    this._labelingGroupGateway.getLabelingGroups().then(result => {
      // Find the corresponding group in the list of all groups
      this.group = result.labelingGroups
        .filter(group => group.id === this._$stateParams.groupId)
        .pop();

      this.groupCoordinatorId = this.group.coordinators[0];
      this.groupLabelers = this.group.labelers.map(labelerId => result.users[labelerId]);

      --this.loadingInProgress;
    });
  }

  _loadAllUsers() {
    ++this.loadingInProgress;
    this._userGateway.getUsers().then(users => {
      this.users = users;
      this.possibleCoordinators = users.filter(user => user.roles.includes('ROLE_LABEL_COORDINATOR'));
      this.possibleLabelers = users.filter(user => !user.roles.includes('ROLE_LABEL_COORDINATOR') && user.roles.includes('ROLE_LABELER'));
      --this.loadingInProgress;
    });
  }
}

LabelingGroupsDetailController.$inject = [
  '$scope',
  '$stateParams',
  '$state',
  'user',
  'userPermissions',
  'labelingGroupGateway',
  'userGateway',
];

export default LabelingGroupsDetailController;
