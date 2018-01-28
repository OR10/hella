class UploadService {
  constructor() {
    this.reset();
  }

  addFile(file) {
    const alreadyAdded = this._files.findIndex(element => element === file) !== -1;
    if (!alreadyAdded) {
      this._files.push(file);
    }
  }

  hasFiles() {
    return this._files.length > 0;
  }

  progress() {
    const amountFiles = this._files.length;

    const overallProgress = this._files.reduce((progress, file) => {
      return progress + (file.progress() / amountFiles);
    }, 0);

    return Math.round(overallProgress * 100);
  }

  reset() {
    this._files = [];
  }

  hasError() {
    return this._files.findIndex(file => file.hasUploadError()) !== -1;
  }

  isComplete() {
    const completedFiles = this._files.filter(file => file.isComplete()).length;
    const allFiles = this._files.length;

    return completedFiles === allFiles;
  }

  getFileErrorsList() {
    let _errors = {}, msg;

    // Make all errors unique. If all files has the same error - show only 1st
    this._files.forEach(file => {
      msg = file.errorMessage && file.errorMessage.message;
      if (msg && !_errors[msg]) {
        _errors[msg] = file.name;
      }
    });

    // attach file name for error
    let _errorsList = [];
    for(let msg in _errors) {
      _errorsList.push(`${msg} (File: ${_errors[msg]})`);
    }
    return _errorsList;
  }
}

export default UploadService;
