import AbstractSimpleMigration from './AbstractSimpleMigration';

class SetProject extends AbstractSimpleMigration {
  constructor(host, port, database, status, logger) {
    super(host, port, database, status, logger);
  }

  migrateTask(task) {
    const projectId = '02b531ffe2c35ee965e4b339a63de052';

    if (!task.projectId) {
      task.projectId = projectId;
    }

    return task;
  }
}

export default SetProject;
