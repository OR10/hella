/**
 * Service to support Group Shape creation
 * So far the only support given is the possibility to open a modal window
 * that let's the user choose which group she/he wants to create
 *
 */
class GroupCreationService {
  /**
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
   * @param {$q} $q
   */
  constructor(modalService, SelectionDialog, $q) {
    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {SelectionDialog}
     * @private
     */
    this._SelectionDialog = SelectionDialog;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
  }

  /**
   * @param {Array.<LabelStructureThing>} availableGroups
   */
  setAvailableGroups(availableGroups) {
    this._availableGroups = availableGroups;
  }

  /**
   * @return {Promise}
   */
  showGroupSelector() {
    const deferred = this._$q.defer();

    if (this._availableGroups.length === 1) {
      deferred.resolve(this._availableGroups[0]);
    } else {
      this._showSelectionModal(deferred);
    }

    return deferred.promise;
  }

  /**
   * Show the actual selection modal
   *
   * @param {$q} deferred
   */
  _showSelectionModal(deferred) {
    const confirmCallback = groupId => {
      this._groupSelected(groupId, deferred);
    };

    const abortCallback = () => {
      this._abortGroupCreation(deferred);
    };

    this._modalService.show(
      new this._SelectionDialog(
        {
          title: 'Select Group Type',
          headline: `Please select the type of group you would like to create`,
          message: 'The following groups are available:',
          confirmButtonText: 'Accept and Create',
          data: this._availableGroups,
        },
        confirmCallback,
        abortCallback,
        { selected: this._availableGroups[0].id }
      )
    );
  }

  /**
   * Callback that is called when user has selected a group and clicked the Accept button
   *
   * @param {String} groupId
   * @param {$q} deferred
   * @private
   */
  _groupSelected(groupId, deferred) {
    if (groupId) {
      const selectedGroup = this._availableGroups.find(group => group.id === groupId);
      deferred.resolve(selectedGroup);
    } else {
      this._showSelectionModal(deferred);
    }
  }

  /**
   * Callback that is called when user aborted the group creation
   *
   * @param {$q} deferred
   * @private
   */
  _abortGroupCreation(deferred) {
    return deferred.reject({cancelledGroupCreation: true});
  }
}

GroupCreationService.$inject = [
  'modalService',
  'SelectionDialog',
  '$q',
];

export default GroupCreationService;
