/**
 * Controller of the {@link TimerDirective}
 */
class TimerController {
  constructor() {
    this.elapsedTime = 15360;
  }

  getMinutes() {
    return Math.floor((this.elapsedTime - (this.getHours() * 3600)) / 60);
  }

  getHours() {
    return Math.floor(this.elapsedTime / 3600);
  }
}

export default TimerController;
