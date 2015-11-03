/**
 * @class ViewerController
 */
export default class ViewerController {
  handleNewAnnotation(id, annotation) {
    this.onNewAnnotation({id, annotation});
  }

  handleUpdatedAnnotation(id, annotation) {
    this.onUpdatedAnnotation({id, annotation});
  }

  handleNextFrameRequested() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameRequested() {
    this.onPreviousFrameRequested();
  }
}
