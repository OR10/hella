/**
 * Service for warming the cache by pre-loading data.
 */
class CacheHeaterService {
  /**
   * @param {CachingLabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {Logger} logger
   */
  constructor(labeledThingInFrameGateway, logger) {
    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {Map}
     * @private
     */
    this._nextHeaterFns = new Map();
  }

  /**
   * Heat up the cache regarding all information needed to properly display one specific {@link LabeledThingInFrame}
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {number} startFrame
   * @param {number} endFrame
   */
  heatLabeledThingInFrame(labeledThingInFrame, startFrame = null, endFrame = null) {
    const {labeledThing, labeledThing: {task}} = labeledThingInFrame;
    const start = startFrame === null ? task.frameRange.startFrameNumber : startFrame;
    const end = endFrame === null ? task.frameRange.endFrameNumber : endFrame;

    this._logger.log(`${CacheHeaterService.LOG_FACILITY}:heat`, 'Heating labeledThingInFrame (%s) %d - %d (%d)', labeledThingInFrame.id, start, end, end - start + 1);

    this._setHeater('labeledThingInFrame', () => {
      this._chunkRequests('labeledThingInFrame', start, end, (chunkedStart, chunkedEnd) =>
        this._labeledThingInFrameGateway.getLabeledThingInFrame(task, chunkedStart, labeledThing, 0, chunkedEnd - chunkedStart + 1)
          .then(results => results.length)
      );
    });
  }

  /**
   * Heat up the cache to have all the information needed to display a certain range of frames
   *
   * This does include the {@link LabeledThingInFrame}s on those frames as well as the required location urls
   *
   * It does however not include specific {@link LabeledThingInFrame} ghosts. Use
   * {@link CacheHeaterService#heatLabeledThingInFrame} for this.
   *
   * @param {Task} task
   * @param {number} startFrame
   * @param {number} endFrame
   */
  heatFrames(task, startFrame = null, endFrame = null) {
    const start = startFrame === null ? task.frameRange.startFrameNumber : startFrame;
    const end = endFrame === null ? task.frameRange.endFrameNumber : endFrame;

    this._logger.log(`${CacheHeaterService.LOG_FACILITY}:heat`, 'Heating frames %d - %d (%d)', start, end, end - start + 1);

    this._setHeater('frames', () => {
      this._chunkRequests('frames', start, end, (chunkedStart, chunkedEnd) =>
        this._labeledThingInFrameGateway.listLabeledThingInFrame(task, chunkedStart, 0, chunkedEnd - chunkedStart + 1)
          // Always return the full frame number range, as their might be frame chunks without labeledThingsInFrame
          .then(() => chunkedEnd - chunkedStart + 1)
      );
    });
  }

  _setHeater(id, heaterFn) {
    const oldNextHeaterFn = this._nextHeaterFns.get(id);

    this._nextHeaterFns.set(id, heaterFn);

    if (oldNextHeaterFn === undefined) {
      // Trigger initial heater startup if no cycle is currently running
      this._nextHeaterFns.get(id)();
    }
  }

  /**
   * Chunk an operation into slices of equal length.
   *
   * @param {string} id
   * @param {number} start
   * @param {number} end
   * @param {Function} chunkFn
   * @private
   */
  _chunkRequests(id, start, end, chunkFn) {
    let currentStart = start;

    const doNextChunk = () => {
      let currentEnd = currentStart + CacheHeaterService.CHUNK_SIZE - 1;
      if (currentEnd > end) {
        currentEnd = end;
      }

      if (currentStart > currentEnd) {
        return;
      }

      this._logger.log(`${CacheHeaterService.LOG_FACILITY}:chunk`, 'Heating cache chunk (%s): %d - %d (%d)', id, currentStart, currentEnd, currentEnd - currentStart + 1);

      chunkFn(currentStart, currentEnd)
        .then(fetchedResults => {
          if (fetchedResults === CacheHeaterService.CHUNK_SIZE && currentEnd < end) {
            // Next chunk needed
            currentStart += CacheHeaterService.CHUNK_SIZE;
            requestAnimationFrame(() => this._nextHeaterFns.get(id)());
          } else {
            this._logger.log(`${CacheHeaterService.LOG_FACILITY}:heat`, 'Cache is warm %s (%d - %d) (%d)', id, start, end, end - start + 1);
            this._nextHeaterFns.delete(id);
          }
        })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
          this._nextHeaterFns.delete(id);
        });
    };

    this._nextHeaterFns.set(id, doNextChunk);
    requestAnimationFrame(() => doNextChunk());
  }
}

CacheHeaterService.LOG_FACILITY = 'cacheHeater';
CacheHeaterService.CHUNK_SIZE = 20;

CacheHeaterService.$inject = [
  'cachingLabeledThingInFrameGateway',
  'loggerService',
];

export default CacheHeaterService;
