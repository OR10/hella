import AbstractSimpleMigration from './AbstractSimpleMigration';

class LabelingTaskStatusRenaming extends AbstractSimpleMigration {
    constructor(host, port, database, status, logger) {
        super(host, port, database, status, logger);
    }

    migrateTask(task) {
        if (task.type === 'AppBundle.Model.LabelingTask') {
            switch (task.status) {
                case 'waiting':
                    task.status = 'todo';
                    break;
                case 'labeled':
                    task.status = 'done';
                    break;
            }
        }

        return task;
    }
}

export default LabelingTaskStatusRenaming;
