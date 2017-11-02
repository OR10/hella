class ReportingController {

  /**
   * @param {User} user
   * @param {TaskGateway} taskGateway
   * @param {UserPermissions} userPermissions
   * @param {Project} project
   * @param {Report} report
   */
  constructor($state, taskGateway, user, userPermissions, project, report) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    this.user = user;
    this.userPermissions = userPermissions;
    this.project = project;
    this.report = report;

    this.classesThingList = this._getClassesThingList(report.report.numberOfTotalClassesInLabeledThingInFrameByClasses);
  }

  goToTaskView(taskId) {
    this._taskGateway.getTask(taskId).then(task => {
      const phase = task.getPhase();
      const projectId = task.projectId;
      return this._$state.go('labeling.tasks.detail', {taskId, phase, projectId});
    });
  }

  /**
   * @param objectTree
   * @returns {Array}
   * @private
   */
  _getClassesThingList(objectTree) {
    const list = [];

    Object.keys(objectTree).forEach(thingKey => {
      const thing = objectTree[thingKey];
      list.push({
        type: 'thing',
        name: thingKey,
        labeledThings: thing.labeledThings,
        labeledThingInFrames: thing.labeledThingInFrames,
      });

      Object.keys(thing.childs).forEach(classKey => {
        const classElements = thing.childs[classKey];
        list.push({
          type: 'class',
          name: classKey,
          labeledThings: classElements.labeledThings,
          labeledThingInFrames: classElements.labeledThingInFrames,
        });

        Object.keys(classElements.childs).forEach(valueKey => {
          const value = classElements.childs[valueKey];
          list.push({
            type: 'value',
            name: valueKey,
            labeledThings: value.labeledThings,
            labeledThingInFrames: value.labeledThingInFrames,
          });
        });
      });
    });

    return list;
  }
}

ReportingController.$inject = [
  '$state',
  'taskGateway',
  'user',
  'userPermissions',
  'project',
  'report',
];

export default ReportingController;
