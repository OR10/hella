class ReportingController {

  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {Project} project
   * @param {Report} report
   */
  constructor(user, userPermissions, project, report) {
    this.user = user;
    this.userPermissions = userPermissions;
    this.project = project;
    this.report = report;

    this.classesThingList = this.getClassesThingList(report.report.numberOfTotalClassesInLabeledThingInFrameByClasses);
  }

  getClassesThingList(objectTree) {
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
  'user',
  'userPermissions',
  'project',
  'report',
];

export default ReportingController;
