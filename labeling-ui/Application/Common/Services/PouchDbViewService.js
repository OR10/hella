class PouchDbViewService {
  /**
   * @param {string} viewIdentifier
   * @return {{map: map}}
   */
  get(viewIdentifier) {
    // TODO: This needs to be fixed to a nicer implementation! This is just a prototype!
    switch (viewIdentifier) {
      case 'labeledThingInFrameByLabeledThingIdAndIncomplete':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
              emit(doc.labeledThingId, 0 + doc.incomplete); // eslint-disable-line no-undef
            }
          },
          reduce: '_sum',
        };
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
      case 'labeledThingInFrameIncomplete':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
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
      case 'labeledThingGroupInFrameByTaskIdAndFrameIndex':
        return {
          map: function(doc) { // eslint-disable-line func-names
            if (doc.type === 'AppBundle.Model.LabeledThing') {
              doc.groupIds.forEach(
                function(groupId) { // eslint-disable-line func-names
                  for (var i = doc.frameRange.startFrameIndex; i <= doc.frameRange.endFrameIndex; i++) { // eslint-disable-line vars-on-top, no-var, id-length
                    emit([doc.taskId, i], groupId); // eslint-disable-line no-undef
                  }
                }
              );
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
