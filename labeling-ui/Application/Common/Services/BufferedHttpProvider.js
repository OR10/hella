import {isArray} from 'angular';

/**
 * Provider for a buffered version of the $http client
 *
 * The buffering is queue-like, which allows to ensure sequential backend operation
 *
 * Different parallel working queues might be used.
 **/
class BufferedHttpProvider {
  constructor() {
    /**
     * Singleton `$http` like interface returned by this Provider
     *
     * @type {Object}
     * @private
     */
    this._bufferedHttp = null;

    /**
     * Automatically extract and inject revisions
     *
     * Can be disabled for tests
     *
     * @type {boolean}
     * @private
     */
    this._autoExtractInject = true;

    /**
     * Expose a flushBuffers method
     *
     * Usually disabled, but can be enabled for tests
     *
     * @type {boolean}
     * @private
     */
    this._flushExposed = false;
  }

  /**
   * Disable the automatic extraction and injection of revisions
   *
   * This is useful for tests, which should use the bufferedHttp as an isolated black box
   */
  disableAutoExtractionAndInjection() {
    this._autoExtractInject = false;
  }

  /**
   * Create a BufferedHttp implementation and return it.
   *
   * @param {angular.$q} $q
   * @param {angular.$http} $http
   * @param {RevisionManager} revisionManager
   * @param {AbortablePromiseFactory} abortable
   * @param {LoggerService} logger
   * @param {LockService} lockService
   */
  $get($q, $http, revisionManager, abortable, logger, lockService) {
    if (this._bufferedHttp === null) {
      this._bufferedHttp = this.createBufferedHttp($q, $http, revisionManager, abortable, logger, lockService);
    }

    return this._bufferedHttp;
  }

  /**
   * Create a BufferedHttp interface and return it
   *
   * @param {angular.$q} $q
   * @param {angular.$http} $http
   * @param {RevisionManager} revisionManager
   * @param {AbortablePromiseFactory} abortable
   * @param {LoggerService} logger
   * @param {LockService} lockService
   */
  createBufferedHttp($q, $http, revisionManager, abortable, logger, lockService) {
    /**
     * Mapping between buffer names and their corresponding Buffer Object
     *
     * @type {Map.<string, {queue: Array.<Function>, readLock: ReferenceCountingLock, writeLock: ReferenceCountingLock}>}
     * @private
     */
    const _buffers = new Map();


    /**
     * Handle non destructive operations
     *
     * @param {{queue: Array.<Function>, readLock: ReferenceCountingLock, writeLock: ReferenceCountingLock}} buffer
     * @private
     */
    function _handleNextNonDestructive(buffer) {
      if (buffer.writeLock.isLocked) {
        logger.log('bufferedHttp:lock', 'Waiting for write operation to be finished before executing non-destructive request');
        return false;
      }

      const nextInLine = buffer.queue.shift();
      buffer.readLock.acquire();
      logger.log('bufferedHttp:execution', 'Executing queued operation: %s', nextInLine.method);
      nextInLine.execute(() => buffer.readLock.release());
      return true;
    }

    /**
     * Handle destructive operations
     *
     * @param {{queue: Array.<Function>, readLock: ReferenceCountingLock, writeLock: ReferenceCountingLock}} buffer
     * @private
     */
    function _handleNextDestructive(buffer) {
      if (buffer.readLock.isLocked || buffer.writeLock.isLocked) {
        logger.log('bufferedHttp:lock', 'Waiting for read/write operation to be finished before executing destructive request');
        return false;
      }

      const nextInLine = buffer.queue.shift();
      buffer.writeLock.acquire();
      logger.log('bufferedHttp:execution', 'Executing queued operation: %s', nextInLine.method);
      nextInLine.execute(() => buffer.writeLock.release());
      return true;
    }

    /**
     * Handle invocation or wait for next operation based on a buffers queue
     *
     * @param {{queue: Array.<Function>, readLock: ReferenceCountingLock, writeLock: ReferenceCountingLock}} buffer
     * @private
     */
    function _handleNext(buffer) {
      if (buffer.queue.length === 0) {
        return;
      }

      const nextInLine = buffer.queue[0];

      let handled = false;
      switch (nextInLine.method) {
        case 'GET':
        case 'HEAD':
          handled = _handleNextNonDestructive(buffer);
          break;
        default:
          handled = _handleNextDestructive(buffer);
      }

      if (handled) {
        // Look if we can handle the next one as well
        _handleNext(buffer);
      }
    }

    /**
     * Get the buffer with a specific name
     *
     * If it does not exist yet, it will be created and mapped
     *
     * @param {string} name
     * @returns {{promise: Promise}}
     * @private
     */
    function _getBuffer(name) {
      if (!_buffers.has(name)) {
        const buffer = {
          queue: [],
          readLock: lockService.createRefCountLock(undefined, () => _handleNext(buffer)),
          writeLock: lockService.createRefCountLock(undefined, () => _handleNext(buffer)),
        };

        _buffers.set(name, buffer);
      }

      return _buffers.get(name);
    }

    /**
     * Inject the correct revision from the {@link RevisionManager} before firing the request
     *
     * @param {Object} data
     * @private
     */
    function _injectRevision(data) {
      const processableData = isArray(data) ? data : [data];
      processableData.forEach(model => {
        if (!model.id) {
          return;
        }

        try {
          revisionManager.injectRevision(model);
        } catch (error) {
          logger.warn('bufferedHttp:revisionManager', `Could not auto-inject revision into model: `, model);
        }
      });
    }

    /**
     * Extract a new revision for a certain object available due to an answer to a request
     *
     * All extracted revisions will be automatically send to the {@link RevisionManager}
     *
     * @param {Object} data
     * @private
     */
    function _extractRevision(data) {
      if (!data.result) {
        // Assume we do not need to map the data
        logger.warn('bufferedHttp:revisionManager', 'Encountered backend request without the usual {result: ...} structure.', data);
        return;
      }

      let processableData = [];

      const specialKeys = ['labeledThingsInFrame', 'labeledThings', 'labeledThing', 'labeledThingInFrame', 'labelingGroups'];

      if (specialKeys.reduce((find, key) => find || data.result[key] !== undefined, false)) {
        specialKeys.forEach(key => {
          const value = data.result[key];
          if (value === undefined) {
            return;
          }
          if (isArray(value)) {
            processableData = processableData.concat(value);
          } else if (key === 'labeledThings' || key === 'labeledThingsInFrame') {
            processableData = processableData.concat(Object.values(value));
          } else {
            processableData.push(value);
          }
        });
      } else {
        if (isArray(data.result)) {
          processableData = processableData.concat(data.result);
        } else {
          processableData.push(data.result);
        }
      }

      processableData.forEach(model => {
        if (!model.id) {
          return;
        }

        try {
          revisionManager.extractRevision(model);
        } catch (error) {
          logger.warn('bufferedHttp:revisionManager', `Could not auto-extract revision: `, model);
        }
      });
    }

    function _createTimeoutDeferred(oldTimeoutPromise = null) {
      const deferred = $q.defer();

      if (oldTimeoutPromise) {
        oldTimeoutPromise.then(() => deferred.resolve());
      }

      return deferred;
    }

    function _transformToJSON(object) {
      return JSON.parse(JSON.stringify(object));
    }

    /**
     * Fire a new bufferedHttp request using the given `options`
     *
     * `options` are identical to the configuration provided for `$http`
     *
     * If no `bufferName` name is given `default` is used.
     * @name BufferedHttp
     * @extends Function
     * @param {Object} options
     * @param {string} bufferName
     * @return {AbortablePromise}
     */
    const bufferedHttp = function BufferedHttp(options, bufferName = 'default') { // eslint-disable-line no-extra-bind
      let timeoutDeferred;
      if (options.timeout) {
        timeoutDeferred = _createTimeoutDeferred(options.timeout);
      } else {
        timeoutDeferred = _createTimeoutDeferred();
      }
      options.timeout = timeoutDeferred.promise;

      return abortable($q((resolveExternal, rejectExternal) => {
        const buffer = _getBuffer(bufferName);

        logger.log('bufferedHttp:queue', 'Queuing operation: %s %s', options.method, options.url);
        buffer.queue.push({
          method: options.method,
          execute: resolveInternal => {
            if (!!options.data) {
              options.data = _transformToJSON(options.data);
            }

            if (!!options.data && this._autoExtractInject) {
              _injectRevision(options.data);
            }

            $http(options)
              .then(result => {
                if (result && result.data && this._autoExtractInject) {
                  _extractRevision(result.data);
                }
                resolveInternal();
                resolveExternal(result);
              })
              .catch(error => {
                resolveInternal();
                rejectExternal(error);
              });
          },
        });

        _handleNext(buffer);
      }), timeoutDeferred);
    }.bind(this);

    // Create $http like shortcuts (without body)
    ['get', 'head', 'delete', 'jsonp'].forEach(method => {
      /**
       * @name BufferedHttp#get
       * @param {string} url
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      /**
       * @name BufferedHttp#head
       * @param {string} url
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      /**
       * @name BufferedHttp#delete
       * @param {string} url
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      /**
       * @name BufferedHttp#jsonp
       * @param {string} url
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      bufferedHttp[method] = (url, config = {}, bufferName = 'default') => {
        if (typeof config === 'string') {
          throw new Error('Config is not allowed to be a string. Did you give me a bufferName as options?');
        }
        const processedConfig = Object.assign({}, config, {url, method: method.toUpperCase()});
        return bufferedHttp(processedConfig, bufferName);
      };
    });

    // Create $http like shortcuts (with body)
    ['post', 'put', 'patch'].forEach(method => {
      /**
       * @name BufferedHttp#post
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      /**
       * @name BufferedHttp#put
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      /**
       * @name BufferedHttp#patch
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @param {string?} bufferName
       * @returns {AbortablePromise}
       */
      bufferedHttp[method] = (url, data, config = {}, bufferName = 'default') => {
        if (typeof config === 'string') {
          throw new Error('Config is not allowed to be a string. Did you give me a bufferName as options?');
        }
        const processedConfig = Object.assign({}, config, {url, data, method: method.toUpperCase()});
        return bufferedHttp(processedConfig, bufferName);
      };
    });

    return bufferedHttp;
  }
}

BufferedHttpProvider.prototype.$get.$inject = [
  '$q',
  '$http',
  'revisionManager',
  'abortablePromiseFactory',
  'loggerService',
  'lockService',
];

export default BufferedHttpProvider;
