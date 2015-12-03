/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor($interval) {
    this.elapsedTime = 15360;
    this.elapsedHours = Math.floor(this.elapsedTime / 3600);
    this.elapsedMinutes = Math.floor((this.elapsedTime - (this.elapsedHours * 3600)) / 60);

    $interval(this.interval.bind(this), 1000);
  }

  interval() {
    this.elapsedTime++;
    this.elapsedHours = Math.floor(this.elapsedTime / 3600);
    this.elapsedMinutes = Math.floor((this.elapsedTime - (this.elapsedHours * 3600)) / 60);
  }
}

TimerController.$inject = ['$interval'];

export default TimerController;
