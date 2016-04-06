import AbstractSimpleMigration from './AbstractSimpleMigration';

class FrameNumberMapping extends AbstractSimpleMigration {
  constructor(host, port, database, status, logger) {
    super(host, port, database, status, logger);
  }

  migrateTask(task) {
    const frameCount = task.frameRange.endFrameNumber - task.frameRange.startFrameNumber + 1;

    const frameNumberMapping = (new Array(frameCount)).fill(null).map(
      (_, index) => task.frameRange.startFrameNumber + index
    );
    task.frameNumberMapping = frameNumberMapping;

    task.metaData = {
      frameRange: task.frameRange,
      frameSkip: 1,
    };

    delete task.frameRange;

    return task;
  }

  migrateLabeledThing(labeledThing, task) {
    const startFrameNumber = labeledThing.frameRange.startFrameNumber;
    const endFrameNumber = labeledThing.frameRange.endFrameNumber;

    delete labeledThing.frameRange.startFrameNumber;
    delete labeledThing.frameRange.endFrameNumber;

    labeledThing.frameRange.startFrameIndex = startFrameNumber - task.frameRange.startFrameNumber;
    labeledThing.frameRange.endFrameIndex = endFrameNumber - task.frameRange.startFrameNumber;

    return labeledThing;
  }

  migrateLabeledThingInFrame(labeledThingInFrame, labeledThing, task) {
    const frameNumber = labeledThingInFrame.frameNumber;

    delete labeledThingInFrame.frameNumber;

    labeledThingInFrame.frameIndex = frameNumber - task.frameRange.startFrameNumber;

    return labeledThingInFrame;
  }
}

export default FrameNumberMapping;
