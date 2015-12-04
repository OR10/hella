/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor($interval, timerGateway) {
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

    this.timerGateway.getTime(this.task.id, this.user.id).then(this.init.bind(this));
  }

  init(timer) {
    this.elapsedTime = timer.time;
    this.calculateTime();
    this.$interval(this.interval.bind(this), this.waitTime * 1000);
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

TimerController.$inject = ['$interval', 'timerGateway'];

export default TimerController;
