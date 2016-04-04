import AbstractMigration from './AbstractMigration';

import {
  PowerlineStatus,
  StaticSegment,
  StartTimeSegment,
  CounterSegment,
  PerSecondSegment,
  palette
} from 'powerline-statusbar';

const Solarized = palette.Solarized;

class AbstractSimpleMigration extends AbstractMigration {
  constructor(host, port, migration, database, logger) {
    super(host, port, migration, database, logger);

    // Setup statusbar
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

    this._powerline = new PowerlineStatus(
      new StaticSegment(migration, {foreground: Solarized.base3, background: Solarized.yellow}),
      new StartTimeSegment('', {foreground: Solarized.base3, background: Solarized.orange}),
      this._taskStats,
      this._labeledThingStats,
      this._labeledThingInFrameStats
    );
  }

  run() {
    return Promise.resolve()
      .then(() => this._updateStatus())
      .then(() => {
        this._logger.info('Retrieving Tasks');
        return this._pouchdb.query(
          document => {
            if (document.type === 'AppBundle.Model.LabelingTask') {
              emit(document._id);
            }
          },
          {
            include_docs: false,
          }
        );
      })
      .then(
        resultSet => this._serialThenOnArray(resultSet.rows, row => this._visitTaskId(row.key))
      );
  }

  migrateTask(task) {
    // Should be overwritten by child
    return task;
  }

  migrateLabeledThing(labeledThing, task) {
    // Should be overwritten by child
    return labeledThing;
  }

  migrateLabeledThingInFrame(labeledThingInFrame, labeledThing, task) {
    // Should be overwritten by child
    return labeledThingInFrame;
  }

  _visitTaskId(id) {
    this._logger.info(`Loading Task: ${id}`);
    return this._pouchdb.get(id)
      .then(task => this._visitTask(task));
  }

  _visitTask(task) {
    this._logger.info(`Retrieving LabeledThings for task ${task._id}`);
    return this._pouchdb.query(document => {
        if (
          document.type === 'AppBundle.Model.LabeledThing' &&
          document.taskId === task._id
        ) {
          emit(document._id);
        }
      },
      {include_docs: false})
      .then(
        resultSet => this._serialThenOnArray(resultSet.rows, row => this._visitLabeledThingId(row.key, task))
      )
      .then(() => {
        this._logger.storage(`Migrating Task ${task._id}`);
        return this._pouchdb.put(
          this.migrateTask(task)
        );
      })
      .then(() => {
        this._taskStats.step();
        this._updateStatus();
      });
  }

  _visitLabeledThingId(id, task) {
    this._logger.info(`Loading LabeledThing: ${id}`);
    return this._pouchdb.get(id)
      .then(labeledThing => this._visitLabeledThing(labeledThing, task));
  }

  _visitLabeledThing(labeledThing, task) {
    this._logger.info(`Retrieving LabeledThingInFrame for labeldThing ${labeledThing._id}`);
    return this._pouchdb.query(document => {
        if (
          document.type === 'AppBundle.Model.LabeledThingInFrame' &&
          document.labeledThingId === labeledThing._id
        ) {
          emit(document._id);
        }
      },
      {include_docs: false})
      .then(
        resultSet => this._serialThenOnArray(resultSet.rows, row => this._visitLabeledThingInFrameId(row.key, labeledThing, task))
      )
      .then(() => {
        this._logger.storage(`Migrating LabeledThing ${labeledThing._id}`);
        return this._pouchdb.put(
          this.migrateLabeledThing(labeledThing, task)
        );
      })
      .then(() => {
        this._labeledThingStats.step();
        this._updateStatus();
      });
  }

  _visitLabeledThingInFrameId(id, labeledThing, task) {
    this._logger.info(`Loading LabeledThingInFrame: ${id}`);
    return this._pouchdb.get(id)
      .then(labeledThingInFrame => this._visitLabeledThingInFrame(labeledThingInFrame, labeledThing, task));
  }

  _visitLabeledThingInFrame(labeledThingInFrame, labeledThing, task) {
    return Promise.resolve()
      .then(() => {
        this._logger.storage(`Migrating LabeledThingInFrame ${labeledThingInFrame._id}`);
        return this._pouchdb.put(
          this.migrateLabeledThingInFrame(labeledThingInFrame, labeledThing, task)
        );
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
