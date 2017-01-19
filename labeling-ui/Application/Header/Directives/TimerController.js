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
    this.idleTimeout = 15;

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

    /**
     *
     * @type {boolean}
     */
    this.listenToEvents = true;


    this._intervalHandle = null;
    this._idleTimeoutHandle = null;

    $element.on('$destroy', () => this.deinit());

    $document.on('mousedown', () => {
      this.triggerAction();
    });

    $document.on('keypress', () => {
      this.triggerAction();
    });

    this.timerGateway.getTime(this.task, this.user).then(this.init.bind(this));
  }

  triggerAction() {
    if (this.listenToEvents) {
      this.isIdle = false;
      this.$interval.cancel(this._idleTimeoutHandle);
      this.startIdleTimer();
    }
  }

  init(timerModel) {
    this.elapsedTime = timerModel.time;
    this.calculateTime();
    if (!this.readOnly) {
      this._intervalHandle = this.$interval(this.saveTime.bind(this), this.saveFrequency * 1000);
      this.startIdleTimer();
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
      this.timerGateway.updateTime(this.task.id, this.user.id, this.elapsedTime).then(() => {
        this.listenToEvents = true;
      }).catch(() => {
        this.setIdle();
        this.deinit();
        this.listenToEvents = false;
      });
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
