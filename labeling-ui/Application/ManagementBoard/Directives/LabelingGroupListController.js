/**
 * Controller of the {@link LabelingGroupListDirective}
 */
class LabelingGroupListController {
  /**
   * @param {$state} $state
   * @param {LabelingGroupGateway} labelingGroupGateway
   * @param {ModalService} modalService
   */
  constructor($state, labelingGroupGateway, modalService, ListDialog) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {LabelingGroupGateway}
     * @private
     */
    this._labelingGroupGateway = labelingGroupGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ListDialog}
     * @private
     */
    this._ListDialog = ListDialog;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {Array.<LabelingGroup>}
     */
    this.groups = [];

    /**
     * @type {Object.<string, User>}
     */
    this.users = {};

    this.updateGroups();
  }

  updateGroups() {
    this.loadingInProgress = true;
    this._labelingGroupGateway.getLabelingGroups().then(result => {
      this.groups = result.labelingGroups;
      this.users = result.users;
      this.loadingInProgress = false;
    });
  }

  createNewGroup() {
    this._$state.go('labeling.labeling-groups.detail', {groupId: 'new'});
  }

  openGroup(id) {
    this._$state.go('labeling.labeling-groups.detail', {groupId: id});
  }

  deleteGroup(id) {
    this.loadingInProgress = true;
    this._labelingGroupGateway.deleteLabelingGroup(id)
      .then(response => {
        if (response.message !== undefined && response.projectNames !== undefined) {
          this._modalService.show(
            new this._ListDialog(
              {
                title: 'Failed to delete labeling-Group.',
                headline: `An Error occurred`,
                message: response.message,
                confirmButtonText: 'Continue',
                data: response.projectNames,
              },
              undefined,
              undefined,
              {
                abortable: false,
                warning: false,
              }
            )
          );
          this.loadingInProgress = false;
        } else {
          this.updateGroups();
        }
      });
  }
}

LabelingGroupListController.$inject = [
  '$state',
  'labelingGroupGateway',
  'modalService',
  'ListDialog',
];

export default LabelingGroupListController;
