/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor($interval, timerGateway) {
    this.timerGateway = timerGateway;
    this.elapsedTime = 0;
    this.elapsedHours = 0;
    this.elapsedMinutes = 0;
  }

  init(time) {
    this.elapsedTime = time;
    this.calculateTime();
    $interval(this.interval.bind(this), 1000);
  }

  interval() {
    this.elapsedTime++;
    this.timerGateway.setTime()
    this.calculateTime();
  }

  calculateTime() {
    this.elapsedHours = Math.floor(this.elapsedTime / 3600);
    this.elapsedMinutes = Math.floor((this.elapsedTime - (this.elapsedHours * 3600)) / 60);
  }
}

TimerController.$inject = ['$interval', 'timerGateway'];

export default TimerController;
