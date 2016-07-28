/**
 * Controller of the {@link LabelingGroupListDirective}
 */
class LabelingGroupListController {
  /**
   * @param {$state} $state
   * @param {LabelingGroupGateway} labelingGroupGateway
   * @param {ModalService} modalService
   */
  constructor($state, labelingGroupGateway, modalService) {
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
      .then(() => this.updateGroups());
  }
}

LabelingGroupListController.$inject = [
  '$state',
  'labelingGroupGateway',
  'modalService',
];

export default LabelingGroupListController;
