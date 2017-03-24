class PouchDbViewService {
  /**
   * @param {string} viewIdentifier
   * @return {{map: map}}
   */
  get(viewIdentifier) {
    // TODO: This needs to be fixed to a nicer implementation! This is just a prototype!
    switch (viewIdentifier) {
      case 'labeledThingInFrameByTaskIdAndFrameIndex':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
              emit([doc.taskId, doc.frameIndex]); // eslint-disable-line no-undef
            }
          },
        };
      case 'taskTimerByTaskIdAndUserId':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.TaskTimer') {
              emit([doc.taskId, doc.userId]); // eslint-disable-line no-undef
            }
          },
        };
      case 'labeledThingIncomplete':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThing') {
              emit([doc.taskId, doc.incomplete]); // eslint-disable-line no-undef
            }
          },
        };
      case 'labeledThingInFrameByLabeledThingIdAndFrameIndex':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
              emit([doc.labeledThingId, doc.frameIndex]); // eslint-disable-line no-undef
            }
          },
        };
      default:
        throw new Error(`Unknown view identifier ${viewIdentifier}`);
    }
  }
}

PouchDbViewService.$inject = [];

export default PouchDbViewService;
