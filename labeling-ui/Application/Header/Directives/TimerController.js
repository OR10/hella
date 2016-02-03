/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor($document, $element, $interval, timerGateway) {
    /**
     * @param {angular.$interval}
     */
    this.$interval = $interval;

    /**
     * @param {TimerGateway}
     */
    this.timerGateway = timerGateway;

    /**
     * Time between two syncs in seconds
     * @type {number}
     */
    this.saveFrequency = 10;

    /**
     * Time after the last mouse click the user is seen as idle
     * @type {number}
     */
    this.idleTimeout = 60;

    /**
     * The time spent in this task in seconds
     * @type {number}
     */
    this.elapsedTime = 0;

    /**
     * @type {number}
     */
    this.elapsedHours = 0;

    /**
     * @type {number}
     */
    this.elapsedMinutes = 0;

    /**
     * @type {boolean}
     */
    this.isIdle = false;


    this._intervalHandle = null;
    this._idleTimeoutHandle = null;

    $element.on('$destroy', () => this.deinit());

    $document.on('mousedown', () => {
      this.isIdle = false;
      this.$interval.cancel(this._idleTimeoutHandle);
      this.startIdleTimer();
    });

    this.timerGateway.getTime(this.task.id, this.user.id).then(this.init.bind(this));
  }

  init(timer) {
    this.elapsedTime = timer.time;
    this.calculateTime();
    if (!this.readOnly) {
      this._intervalHandle = this.$interval(this.saveTime.bind(this), this.saveFrequency * 1000);
      this.startIdleTimer()
    }
  }

  startIdleTimer() {
    this._idleTimeoutHandle = this.$interval(this.setIdle.bind(this), this.idleTimeout * 1000);
  }

  deinit() {
    if (this._intervalHandle !== null) {
      this.$interval.cancel(this._intervalHandle);
    }
    if (this._idleTimeoutHandle !== null) {
      this.$interval.cancel(this._idleTimeoutHandle);
    }
  }

  saveTime() {
    if (!this.isIdle) {
      this.elapsedTime += this.saveFrequency;
      this.calculateTime();
      this.timerGateway.updateTime(this.task.id, this.user.id, this.elapsedTime);
    }
  }

  calculateTime() {
    this.elapsedHours = Math.floor(this.elapsedTime / 3600);
    this.elapsedMinutes = Math.floor((this.elapsedTime - (this.elapsedHours * 3600)) / 60);
  }

  setIdle() {
    this.isIdle = true;
  }
}

TimerController.$inject = [
  '$document',
  '$element',
  '$interval',
  'timerGateway',
];

export default TimerController;
