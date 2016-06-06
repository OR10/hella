import AbstractMigration from './AbstractMigration';

import {
  PowerlineStatus,
  StaticSegment,
  StartTimeSegment,
  CounterSegment,
  palette,
} from 'powerline-statusbar';

const Solarized = palette.Solarized;

class AbstractSimpleMigration extends AbstractMigration {
  constructor(host, port, migration, database, logger) {
    super(host, port, migration, database, logger);

    // Setup statusbar
    this._projectStats = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'Projects: ',
    });

    this._taskStats = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'Tasks: ',
    });

    this._labeledThingStats = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'LabeledThings: ',
    });
    this._labeledThingInFrameStats = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin', fill: true,
      prefix: 'LabeledThingsInFrame: ',
    });

    this._timerStats = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'Timers: ',
    });

    this._powerline = new PowerlineStatus(
      new StaticSegment('CouchDB Migration', {foreground: Solarized.base3, background: Solarized.violet}),
      new StaticSegment(migration, {foreground: Solarized.base3, background: Solarized.yellow}),
      new StartTimeSegment('', {foreground: Solarized.base3, background: Solarized.orange}),
      this._projectStats,
      this._taskStats,
      this._labeledThingStats,
      this._labeledThingInFrameStats
    );
  }

  run() {
    return Promise.resolve()
      .then(() => this._updateStatus())
      .then(() => {
        this._logger.storage('Creating needed views');
        return this._createMigrationViews();
      })
      .then(() => {
        this._logger.info('Retrieving Projects');
        return this._pouchdb.query('migration__/projects', {
          include_docs: false,
        });
      })
      .then(
        resultSet => this._serialThenOnArray(resultSet.rows, row => this._visitProjectId(row.key))
      )
      .then(() => {
        this._logger.storage('Removing migration views');
        return this._removeMigrationViews();
      });
  }

  migrateProject(project) { // eslint-disable-line no-unused-vars
    // Should be overwritten by child
    return false;
  }

  migrateTask(task, project) { // eslint-disable-line no-unused-vars
    // Should be overwritten by child
    return false;
  }

  migrateLabeledThing(labeledThing, task, project) { // eslint-disable-line no-unused-vars
    // Should be overwritten by child
    return false;
  }

  migrateLabeledThingInFrame(labeledThingInFrame, labeledThing, task, project) { // eslint-disable-line no-unused-vars
    // Should be overwritten by child
    return false;
  }

  migrateTimer(timer, task, project) { // eslint-disable-line no-unused-vars
    // Should be overwritten by child
    return false;
  }

  _createMigrationViews() {
    return this._pouchdb.put({
      _id: `_design/migration__`,
      views: {
        projects: {
          map: function(document) { // eslint-disable-line func-names
            if (document.type === 'AppBundle.Model.Project') {
              emit(document._id); // eslint-disable-line no-undef
            }
          }.toString(),
        },
        tasksByProjectId: {
          map: function(document) { // eslint-disable-line func-names
            if (document.type === 'AppBundle.Model.LabelingTask') {
              emit(document.projectId, document._id); // eslint-disable-line no-undef
            }
          }.toString(),
        },
        timersByTaskId: {
          map: function(document) { // eslint-disable-line func-names
            if (document.type === 'AppBundle.Model.TaskTimer') {
              emit(document.taskId, document._id); // eslint-disable-line no-undef
            }
          }.toString(),
        },
        labeledThingsByTaskId: {
          map: function(document) { // eslint-disable-line func-names
            if (document.type === 'AppBundle.Model.LabeledThing') {
              emit(document.taskId, document._id); // eslint-disable-line no-undef
            }
          }.toString(),
        },
        labeledThingsInFrameByLabeledThingId: {
          map: function(document) { // eslint-disable-line func-names
            if (document.type === 'AppBundle.Model.LabeledThingInFrame') {
              emit(document.labeledThingId, document._id); // eslint-disable-line no-undef
            }
          }.toString(),
        },
      },
    }).catch(error => {
      if (error.status === 409) {
        return Promise.reject(
          new Error(
            'Design document "_design/migrate__" does already exist. Delete it before migration.'
          )
        );
      }

      return Promise.reject(error);
    });
  }

  _removeMigrationViews() {
    return this._pouchdb.remove('_design/migration__');
  }

  _visitProjectId(id) {
    this._logger.info(`Loading Project: ${id}`);
    return this._pouchdb.get(id)
      .then(project => this._visitProject(project));
  }

  _visitProject(project) {
    this._logger.info(`├── Retrieving Tasks for Project "${project.name}" (${project._id})`);
    return this._pouchdb.query('migration__/tasksByProjectId', {
      key: project._id,
      include_docs: false,
    })
      .then(
        resultSet => {
          return this._serialThenOnArray(resultSet.rows, row => this._visitTaskId(row.value, project));
        })
      .then(() => {
        this._logger.storage(`Migrating Project "${project.name}" (${project._id})`);
        const migratedProject = this.migrateProject(project);
        if (migratedProject !== false) {
          return this._pouchdb.put(migratedProject);
        }
      })
      .then(() => {
        this._projectStats.step();
        this._updateStatus();
      });
  }

  _visitTaskId(id, project) {
    this._logger.info(`├── Loading Task: ${id}`);
    return this._pouchdb.get(id)
      .then(task => this._visitTask(task, project));
  }

  _visitTask(task, project) {
    this._logger.info(`│   ├── Retrieving LabeledThings for task ${task._id}`);
    return this._pouchdb.query('migration__/labeledThingsByTaskId', {
      key: task._id,
      include_docs: false,
    })
      .then(resultSet => {
        return this._serialThenOnArray(resultSet.rows, row => this._visitLabeledThingId(row.value, task, project));
      })
      .then(() => {
        this._logger.info(`│   ├── Retrieving Timers for task ${task._id}`);
        return this._pouchdb.query('migration__/timersByTaskId', {
          key: task._id,
          include_docs: false,
        });
      })
      .then(resultSet => {
        return this._serialThenOnArray(resultSet.rows, row => this._visitTimerId(row.value, task, project));
      })
      .then(() => {
        this._logger.storage(`├── Migrating Task ${task._id}`);
        const migratedTask = this.migrateTask(task, project);
        if (migratedTask !== false) {
          return this._pouchdb.put(migratedTask);
        }
      })
      .then(() => {
        this._taskStats.step();
        this._updateStatus();
      });
  }

  _visitTimerId(id, task, project) {
    this._logger.info(`│   ├── Loading Timer: ${id}`);
    return this._pouchdb.get(id)
      .then(timer => this._visitTimer(timer, task, project));
  }

  _visitTimer(timer, task, project) {
    return Promise.resolve()
      .then(() => {
        this._logger.storage(`│   │   ├── Migrating Timer ${timer._id}`);
        const migratedTimer = this.migrateTimer(timer, task, project);
        if (migratedTimer !== false) {
          return this._pouchdb.put(migratedTimer);
        }
      })
      .then(() => {
        this._timerStats.step();
        this._updateStatus();
      });
  }

  _visitLabeledThingId(id, task, project) {
    this._logger.info(`│   ├── Loading LabeledThing: ${id}`);
    return this._pouchdb.get(id)
      .then(labeledThing => this._visitLabeledThing(labeledThing, task, project));
  }

  _visitLabeledThing(labeledThing, task, project) {
    this._logger.info(`│   │   ├── Retrieving LabeledThingInFrames for labeldThing ${labeledThing._id}`);
    return this._pouchdb.query('migration__/labeledThingsInFrameByLabeledThingId', {
      key: labeledThing._id,
      include_docs: false,
    })
      .then(
        resultSet => this._serialThenOnArray(resultSet.rows, row => this._visitLabeledThingInFrameId(row.value, labeledThing, task, project))
      )
      .then(() => {
        this._logger.storage(`│   ├── Migrating LabeledThing ${labeledThing._id}`);
        const migratedLabeledThing = this.migrateLabeledThing(labeledThing, task, project);
        if (migratedLabeledThing !== false) {
          return this._pouchdb.put(migratedLabeledThing);
        }
      })
      .then(() => {
        this._labeledThingStats.step();
        this._updateStatus();
      });
  }

  _visitLabeledThingInFrameId(id, labeledThing, task, project) {
    this._logger.info(`│   │   │   ├── Loading LabeledThingInFrame: ${id}`);
    return this._pouchdb.get(id)
      .then(labeledThingInFrame => this._visitLabeledThingInFrame(labeledThingInFrame, labeledThing, task, project));
  }

  _visitLabeledThingInFrame(labeledThingInFrame, labeledThing, task, project) {
    return Promise.resolve()
      .then(() => {
        this._logger.storage(`│   │   │   ├── Migrating LabeledThingInFrame ${labeledThingInFrame._id}`);
        const migratedLabeledThingInFrame = this.migrateLabeledThingInFrame(labeledThingInFrame, labeledThing, task, project);
        if (migratedLabeledThingInFrame !== false) {
          return this._pouchdb.put(migratedLabeledThingInFrame);
        }
      })
      .then(() => {
        this._labeledThingInFrameStats.step();
        this._updateStatus();
      });
  }

  _serialThenOnArray(arr, fn) {
    return arr.reduce(
      (previousPromise, currentItem) => previousPromise.then(
        previousResult => fn(currentItem, previousResult)
      ),
      Promise.resolve()
    );
  }

  _updateStatus() {
    this._logger.updateStatus(this._powerline.render());
  }
}

export default AbstractSimpleMigration;
