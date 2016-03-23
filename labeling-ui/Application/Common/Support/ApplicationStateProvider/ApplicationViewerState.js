import PartialApplicationState from "./PartialApplicationState";

class ApplicationViewerState extends PartialApplicationState{

  constructor() {
    super();
    this._showBackdrop = true;
  }

  get showBackdrop() {
    return this._showBackdrop;
  }

  disable(showBackdrop = true) {
    super.disable();
    this._showBackdrop = showBackdrop;
  }

}

export default ApplicationViewerState;