class PartialApplicationState {
  constructor() {
    this._disabled = 0;
    this._working = 0;
  }

  get isDisabled() {
    return this._disabled !== 0;
  }

  disable() {
    this._disabled += 1;
  }

  enable() {
    if (this._disabled === 0) {
      throw new Error('Tried to enable component, which is already enabled. Possible disable/enable mismatch.');
    }

    this._disabled -= 1;
  }

  get isWorking() {
    return this._working !== 0;
  }

  work() {
    this._working += 1;
  }

  finish() {
    if (this._working === 0) {
      throw new Error('Tried to set component to finish, which is already finished. Possible work/finish mismatch.');
    }

    this._working -= 1;
  }
}

export default PartialApplicationState;