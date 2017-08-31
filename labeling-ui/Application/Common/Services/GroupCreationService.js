class GroupCreationService {
  /**
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
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

    this._$q = $q;
  }

  /**
   * @param {Array.<LabelStructureThing>} availableGroups
   */
  setAvailableGroups(availableGroups) {
    this._availableGroups = availableGroups;
  }

  /**
   * @param {Function} groupSelectedCallback
   */
  showGroupSelector() {
    const deferred = this._$q.defer();

    if (this._availableGroups.length === 1) {
      deferred.resolve(this._availableGroups[0]);
    } else {
      this._modalService.show(
        new this._SelectionDialog(
          {
            title: 'Select Group Type',
            headline: `Please select the type of group you would like to create`,
            message: 'The following groups are available:',
            confirmButtonText: 'Accept and Create',
            data: this._availableGroups,
          },
          groupId => {
            if (groupId) {
              const selectedGroup = this._availableGroups.find(group => group.id === groupId);
              // groupSelectedCallback(selectedGroup);
              deferred.resolve(selectedGroup);
            } else {
              this.showGroupSelector();
            }
          },
          null,
          {
            abortable: false,
            selected: this._availableGroups[0].id,
          }
        )
      );
    }

    return deferred.promise;
  };
}

GroupCreationService.$inject = [
  'modalService',
  'SelectionDialog',
  '$q',
];

export default GroupCreationService;