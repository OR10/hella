class GroupCreationService {
  /**
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
   */
  constructor(modalService, SelectionDialog) {
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
  showGroupSelector(groupSelectedCallback) {
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
            groupSelectedCallback(selectedGroup);
          } else {
            this.showGroupSelector(groupSelectedCallback);
          }
        },
        null,
        {
          abortable: false,
        }
      )
    );
  };
}

GroupCreationService.$inject = [
  'modalService',
  'SelectionDialog',
];

export default GroupCreationService;