import {isArray} from 'angular';

/**
 * Provider for a buffered version of the $http client
 *
 * The buffering is queue-like, which allows to ensure sequentiell backend operation
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
  }

  /**
   * Create a BufferedHttp implementation and return it.
   *
   * @param {angular.$q} $q
   * @param {angular.$http} $http
   * @param {RevisionManager} revisionManager
   */
  $get($q, $http, revisionManager) {
    if (this._bufferedHttp === null) {
      this._bufferedHttp = this.createBufferedHttp($q, $http, revisionManager);
    }

    return this._bufferedHttp;
  }

  /**
   * Create a BufferedHttp interface and return it
   *
   * @param {angular.$q} $q
   * @param {angular.$http} $http
   * @param {RevisionManager} revisionManager
   */
  createBufferedHttp($q, $http, revisionManager) {
    /**
     * Mapping between buffer names and their corresponding Buffer Promise
     *
     * @type {Map.<string, {promise: Promise}>}
     * @private
     */
    const _buffers = new Map();

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
        _buffers.set(name, {promise: Promise.resolve()});
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
        try {
          revisionManager.injectRevision(model)
        } catch (error) {
          console.warn(`Could not auto-inject revision into model: `, model);
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
        console.warn(`Encountered backend request without the usual {result: ...} structure. ${data}`);
        return;
      }

      const processableData = isArray(data.result) ? data.result : [data.result];
      processableData.forEach(model => {
        try {
          revisionManager.extractRevision(model)
        } catch (error) {
          console.warn(`Could not auto-extract revision: `, model);
        }
      });
    }

    /**
     * Fire a new bufferedHttp request using the given `options`
     *
     * `options` are identical to the configuration provided for `$http`
     *
     * If no `bufferName` name is given `default` is used.
     * @name BufferedHttp
     * @param {Object} options
     * @param {string} bufferName
     */
    function bufferedHttp(options, bufferName = 'default') {
      return $q((resolve, reject) => {
        const buffer = _getBuffer(bufferName);
        buffer.promise = buffer.promise.then(() => {
          if (options.data) {
            _injectRevision(options.data);
          }

          $http(options)
            .then(result => {
              if (result.data) {
                _extractRevision(result.data);
              }
              resolve(result);
            })
            .catch(reject);
        });
      });
    }

    // Create $http like shortcuts (without body)
    ['get', 'head', 'delete', 'jsonp'].forEach(method => {
      /**
       * @name BufferedHttp#get
       * @param {string} url
       * @param {Object?} config
       * @returns {Promise}
       */
      /**
       * @name BufferedHttp#head
       * @param {string} url
       * @param {Object?} config
       * @returns {Promise}
       */
      /**
       * @name BufferedHttp#delete
       * @param {string} url
       * @param {Object?} config
       * @returns {Promise}
       */
      /**
       * @name BufferedHttp#jsonp
       * @param {string} url
       * @param {Object?} config
       * @returns {Promise}
       */
      bufferedHttp[method] = (url, config = {}) => {
        const processedConfig = Object.assign({}, config, {method, url});
        return bufferedHttp(processedConfig);
      };
    });

    // Create $http like shortcuts (with body)
    ['post', 'put', 'patch'].forEach(method => {
      /**
       * @name BufferedHttp#post
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @returns {Promise}
       */
      /**
       * @name BufferedHttp#put
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @returns {Promise}
       */
      /**
       * @name BufferedHttp#patch
       * @param {string} url
       * @param {Object} data
       * @param {Object?} config
       * @returns {Promise}
       */
      bufferedHttp[method] = (url, data, config = {}) => {
        const processedConfig = Object.assign({}, config, {method, url, data});
        return bufferedHttp(processedConfig);
      };
    });

    return bufferedHttp;
  }
}

BufferedHttpProvider.prototype.$get.$inject = [
  '$q',
  '$http',
  'revisionManager',
];

export default BufferedHttpProvider;
