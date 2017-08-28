import PouchDB from 'pouchdb';
import uuid from 'uuid';
import {forEach, pickBy} from 'lodash';
import PouchDbViewService from '../../../Application/Common/Services/PouchDbViewService';

class PouchDbHelper {
  constructor() {
    /**
     * @type {PouchDB|null}
     */
    this.database = null;

    /**
     * @type {string|null}
     * @private
     */
    this._databaseName = null;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._mockedPouchDbContextService = jasmine.createSpyObj(['provideContextForTaskId']);

    /**
     * @type {LoggerService}
     * @private
     */
    this._mockedLogger = jasmine.createSpyObj(['log', 'groupStart', 'groupEnd','groupStartOpened', 'warn']);
  }

  /**
   * Initialize the Helper
   *
   * This method should be called in a `beforeEach` function of the test suite
   *
   * The operation may be asynchronous there a promise is returned. Use the `done` callback of the `beforeEach` function
   * in order to handle this properly.
   *
   * @return {Promise}
   */
  initialize() {
    return Promise.resolve()
      .then(() => {
        // Destroy old database if initialize is called twice.
        if (this.database !== null) {
          return this.destroy();
        }
      })
      .then(() => {
        this._databaseName = this._generateDatabaseName();
        this.database = new PouchDB(this._databaseName);
      });
  }

  /**
   * Install the couchdb view fixtures into the database
   *
   * The fixtures are installed via the PouchDbViewService.
   *
   * @return {Promise}
   */
  installViews() {
    if (this.database === null) {
      throw new Error('Init database before installing views!');
    }

    this._mockedPouchDbContextService.provideContextForTaskId.and.returnValue(this.database);

    // No idea, why the import does not work correctly in this scenario, but we get the Module instead of the default export here
    const viewService = new PouchDbViewService.default(Promise, this._mockedLogger, this._mockedPouchDbContextService);

    return viewService.installDesignDocuments('task-id-not-relevant-as-context-is-mocked');
  }

  /**
   * Destroy the Helper
   *
   * This method needs be called in a `afterEach` function of the test suite
   *
   * The `afterEach` should be on the same level as the `beforeEach` where {@link PouchDbHelper#initialize} is called
   *
   * The operation may be asynchronous there a promise is returned. Use the `done` callback of the `afterEach` function
   * in order to handle this properly.
   *
   * @return {Promise}
   */
  destroy() {
    if (this.database !== null) {
      return Promise.resolve()
      // @HACK to fix this bug: https://github.com/pouchdb/pouchdb/issues/3415
        .then(() => new Promise(resolve => setTimeout(resolve, 100)))
        .then(() => this.database.destroy())
        .then(() => {
          this.database = null;
          this._databaseName = null;
        });
    }

    return Promise.resolve();
  }

  /**
   * Wait until an async pouchDb operation has been finished.
   *
   * The given `promise` is any promise associated with a PouchDB operation
   *
   * This wrapper is needed for tests, as due to PouchDB and angular they will be a mixture of `Promise` and
   * `angular.$q` promise-like structures, which interact with each other. As the pouch is not mocked completely
   * it will actually take time (async) to complete certain requests.
   *
   * The returned promise will wrap the initial PouchDB related promise and return once the operation completes, calling
   * `$rootScope.$apply` intermittently in order to ensure proper processing of both interacting promise chains.
   *
   * The returned promise will fail and or succeed with the same data as the original promise.
   *
   * @param {$rootScope} $rootScope
   * @param promise
   * @returns {Promise}
   */
  waitForPouchDb($rootScope, promise) {
    return new Promise((resolve, reject) => {
      let state = 'waiting';
      let data = null;

      promise
        .then(result => {
          state = 'resolved';
          data = result;
        })
        .catch(error => {
          state = 'rejected';
          data = error;
        });

      function _cycle() {
        setTimeout(() => {
          switch (state) {
            case 'waiting':
              _cycle();
              break;
            case 'resolved':
              resolve(data);
              break;
            case 'rejected':
              reject(data);
              break;
            default:
              throw new Error(`Invalid state: ${state}`);
          }
          $rootScope.$apply();
        }, 10);
      }

      _cycle();
    });
  }

  /**
   * Generate a random database name for the used testdb
   *
   * @returns {string}
   * @private
   */
  _generateDatabaseName() {
    return `__annostation_test__${uuid.v4().replace(/-/g, '')}`;
  }
}

export default PouchDbHelper;
