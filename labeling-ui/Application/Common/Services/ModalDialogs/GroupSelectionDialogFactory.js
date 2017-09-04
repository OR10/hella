class GroupSelectionDialogFactory {
  /**
   * @param {SelectionDialog} SelectionDialog
   * @param {angular.$q} $q
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
   * @param {LabelStructureService} labelStructureService
   * @param {GroupNameService} groupNameService
   * @param {LoggerService} logger
   */
  constructor(SelectionDialog, $q, labeledThingGroupGateway, labelStructureService, groupNameService, logger) {
    /**
     * @type {SelectionDialog}
     * @private
     */
    this._SelectionDialog = SelectionDialog;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {GroupNameService}
     * @private
     */
    this._groupNameService = groupNameService;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;
  }

  /**
   * Create a dialog for group selection based on the given task/groupIds combo and content
   *
   * The content object is equivalent to the `content` object given to a {@link SelectionDialog}.
   *
   * The following content options are available:
   * - `title`
   * - `headline`
   * - `message`
   * - `defaultSelection`: Text which is displayed if no item was chosen yet.
   * - `confirmButtonText`
   * - `cancelButtonText`
   *
   * The resulting callback parameter for the dialog will be the selected groupId.
   *
   * @param {Task} task
   * @param {string[]} groupIds
   * @param {string?} groupType
   * @param {object} content
   * @param {Function?} confirmCallback
   * @param {Function?} cancelCallback
   * @returns {Promise.<SelectionDialog>}
   */
  createAsync(task, groupIds, groupType, content, confirmCallback, cancelCallback) {
    return this._$q.all([
      this._labeledThingGroupGateway.getLabeledThingGroupsByIds(task, groupIds),
      this._labelStructureService.getLabelStructure(task),
    ])
      .then(([groups, labelStructure]) => {
        const labelStructureGroupsById = labelStructure.getGroups();

        const groupSelections = groups
          .filter(group => groupType === undefined || group.type === groupType)
          .map(group => {
            const uniqueGroupNumber = this._groupNameService.getNameById(group.id);
            const groupName = labelStructureGroupsById.get(group.type).name;
            return {
              id: group.id,
              name: `${uniqueGroupNumber}: ${groupName}`,
            };
          });

        const dialogContent = Object.assign(
          {},
          content,
          {data: groupSelections}
        );

        return new this._SelectionDialog(
          dialogContent,
          groupId => {
            if (confirmCallback) {
              if (groupId) {
                confirmCallback(groups.find(candidate => candidate.id === groupId));
              } else {
                confirmCallback(undefined);
              }
            }
          },
          cancelCallback
        );
      })
      .catch(error => {
        this._logger.warn('dialog:group-selection', error);
        return this._$q.reject(error);
      });
  }
}

GroupSelectionDialogFactory.$inject = [
  'SelectionDialog',
  '$q',
  'labeledThingGroupGateway',
  'labelStructureService',
  'groupNameService',
  'loggerService',
];

export default GroupSelectionDialogFactory;
