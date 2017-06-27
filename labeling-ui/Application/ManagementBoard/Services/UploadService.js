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
}

export default UploadService;
