import AbstractSimpleMigration from './AbstractSimpleMigration';

class FrameRangeRenaming extends AbstractSimpleMigration {
  constructor(host, port, database, status, logger) {
    super(host, port, database, status, logger);
  }

  migrateTask(task) {
    const type = 'AppBundle.Model.FrameNumberRange';

    if (task.metaData && task.metaData.frameRange) {
      task.metaData.frameRange.type = type;
    }

    return task;
  }

  migrateLabeledThing(labeledThing, task) {
    const type = 'AppBundle.Model.FrameIndexRange';

    if (labeledThing.frameRange) {
      labeledThing.frameRange.type = type;
    }

    return labeledThing;
  }
}

export default FrameRangeRenaming;
