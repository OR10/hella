/**
 * @class ViewerController
 */
export default class ViewerController {
  constructor() {
    this.activeTool = 'modification';
  }

  handleNewAnnotation(id, annotation) {
    this.onNewAnnotation({id, annotation});
  }

  handleUpdatedAnnotation(id, annotation) {
    this.onUpdatedAnnotation({id, annotation});
  }
}
