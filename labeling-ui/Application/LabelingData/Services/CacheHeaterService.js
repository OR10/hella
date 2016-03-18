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
    this._nextHeaters = new Map();
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

    this._setHeater('labeledThingInFrame', labeledThingInFrame.labeledThing.id, () => {
      this._chunkRequests('labeledThingInFrame', start, end, (chunkedStart, chunkedEnd) =>
        this._labeledThingInFrameGateway.getLabeledThingInFrame(task, chunkedStart, labeledThing, 0, chunkedEnd - chunkedStart + 1)
          .then(results => results.length)
      );
    });
  }

  /**
   * Stop the heating process of a certain `LabeledThingInFrame` if it is currently in a heating phase
   *
   * @param {LabeledThing} labeledThing
   */
  stopHeatingLabeledThing(labeledThing) {
    const heater = this._nextHeaters.get('labeledThingInFrame');
    if (heater && heater.id === labeledThing.id) {
      this._nextHeaters.delete('labeledThingInFrame');
    }
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

    this._setHeater('frames', null, () => {
      this._chunkRequests('frames', start, end, (chunkedStart, chunkedEnd) =>
        this._labeledThingInFrameGateway.listLabeledThingInFrame(task, chunkedStart, 0, chunkedEnd - chunkedStart + 1)
          // Always return the full frame number range, as their might be frame chunks without labeledThingsInFrame
          .then(() => chunkedEnd - chunkedStart + 1)
      );
    });
  }

  _setHeater(group, id, heaterFn) {
    const oldNextHeater = this._nextHeaters.get(group);

    this._nextHeaters.set(group, {id, heaterFn});

    if (!oldNextHeater || !oldNextHeater.heaterFn) {
      // Trigger initial heater startup if no cycle is currently running
      this._nextHeaters.get(group).heaterFn();
    }
  }

  /**
   * Chunk an operation into slices of equal length.
   *
   * @param {string} group
   * @param {number} start
   * @param {number} end
   * @param {Function} chunkFn
   * @private
   */
  _chunkRequests(group, start, end, chunkFn) {
    let currentStart = start;

    const doNextChunk = () => {
      let currentEnd = currentStart + CacheHeaterService.CHUNK_SIZE - 1;
      if (currentEnd > end) {
        currentEnd = end;
      }

      if (currentStart > currentEnd) {
        return;
      }

      this._logger.log(`${CacheHeaterService.LOG_FACILITY}:chunk`, 'Heating cache chunk (%s): %d - %d (%d)', group, currentStart, currentEnd, currentEnd - currentStart + 1);

      chunkFn(currentStart, currentEnd)
        .then(fetchedResults => {
          if (fetchedResults === CacheHeaterService.CHUNK_SIZE && currentEnd < end) {
            // Next chunk needed
            currentStart += CacheHeaterService.CHUNK_SIZE;
            requestAnimationFrame(() => {
              const heater = this._nextHeaters.get(group);
              if (!!heater && !!heater.heaterFn) {
                heater.heaterFn();
              }
            });
          } else {
            this._logger.log(`${CacheHeaterService.LOG_FACILITY}:heat`, 'Cache is warm %s (%d - %d) (%d)', group, start, end, end - start + 1);
            this._nextHeaters.delete(group);
          }
        })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
          this._nextHeaters.delete(group);
        });
    };

    const heater = this._nextHeaters.get(group);
    heater.heaterFn = doNextChunk;
    this._nextHeaters.set(group, heater);
    requestAnimationFrame(() => doNextChunk());
  }
}

CacheHeaterService.LOG_FACILITY = 'cacheHeater';
CacheHeaterService.CHUNK_SIZE = 60;

CacheHeaterService.$inject = [
  'cachingLabeledThingInFrameGateway',
  'loggerService',
];

export default CacheHeaterService;
