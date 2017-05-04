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
     * @type {null|LabelingGroup}
     */
    this.group = null;

    /**
     * @type {string}
     */
    this.groupName = '';

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
      name: true,
    };

    /**
     * Message displayed above the "add labeler" combo box if not `null`
     *
     * @type {null|string}
     */
    this.labelerSelectionMessage = null;

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


    if (!this.createMode) {
      this._loadGroup();
    }

    this._loadAllUsers();
  }

  addLabeler(id) {
    if (id === undefined) {
      // Selection is empty
      this.labelerSelectionMessage = 'Please specify a labeler in the selection field to add.';
      return;
    }

    const user = this.users.find(candidate => candidate.id === id);
    if (this.groupLabelers.includes(user)) {
      this.labelerSelectionMessage = 'Users can not be added twice into the list.';
      return;
    }

    this.labelerSelectionMessage = null;
    this.groupLabelers.push(user);
  }

  removeLabeler(id) {
    this.groupLabelers.splice(
      this.groupLabelers.findIndex(user => user.id === id),
      1
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
        name: this.groupName,
      })
    ).then(() => --this.loadingInProgress);
  }

  _createGroup() {
    ++this.loadingInProgress;
    this._labelingGroupGateway.createLabelingGroup(
      new LabelingGroup({
        coordinators: [this.groupCoordinatorId],
        labelers: this.groupLabelers.map(labeler => labeler.id),
        name: this.groupName,
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

    this.validation.name = true;
    this.validation.coordinator = true;
    this.validation.labelers = true;

    if (this.groupCoordinatorId === null || this.groupCoordinatorId === undefined) {
      this.validation.coordinator = valid = false;
    }

    if (this.groupLabelers.length === 0) {
      this.validation.labelers = valid = false;
    }

    if (this.groupName === '') {
      this.validation.name = valid = false;
    }

    // Remove message if everything is okay.
    if (valid) {
      this.labelerSelectionMessage = null;
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
      this.groupName = this.group.name;

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
