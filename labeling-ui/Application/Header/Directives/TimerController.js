/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor($element, $interval, timerGateway) {
    this.$interval = $interval;
    this.timerGateway = timerGateway;
    /**
     * Time between two syncs in seconds
     * @type {number}
     */
    this.waitTime = 10;

    this.elapsedTime = 0;
    this.elapsedHours = 0;
    this.elapsedMinutes = 0;

    this._intervalHandle = null;

    $element.on('$destroy', () => this.deinit());
    
    this.timerGateway.getTime(this.task.id, this.user.id).then(this.init.bind(this));
  }

  init(timer) {
    this.elapsedTime = timer.time;
    this.calculateTime();
    if (!this.readOnly) {
      this._intervalHandle = this.$interval(this.interval.bind(this), this.waitTime * 1000);
    }
  }

  deinit() {
    if (this._intervalHandle !== null) {
      this.$interval.cancel(this._intervalHandle);
    }
  }

  interval() {
    this.elapsedTime += this.waitTime;
    this.calculateTime();
    this.timerGateway.updateTime(this.task.id, this.user.id, this.elapsedTime);
  }

  calculateTime() {
    this.elapsedHours = Math.floor(this.elapsedTime / 3600);
    this.elapsedMinutes = Math.floor((this.elapsedTime - (this.elapsedHours * 3600)) / 60);
  }
}

TimerController.$inject = [
  '$element',
  '$interval',
  'timerGateway',
];

export default TimerController;
