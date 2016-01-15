class LoadingMaskController {
  constructor() {
    if (this.spinner === undefined) {
      this.spinner = false;
    }

    if (this.backdrop === undefined) {
      this.backdrop = true;
    }

    if (this.blockInteraction === undefined) {
      this.blockInteraction = true;
    }
  }
}

export default LoadingMaskController;
