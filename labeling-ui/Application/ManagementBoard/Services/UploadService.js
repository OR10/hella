class UploadService {
  constructor() {
    this.reset();
  }

  addFile(file) {
    const alreadyAdded = this._files.findIndex(element => element === file) != -1;
    if (!alreadyAdded) {
      this._files.push(file);
    }
  }

  hasFiles() {
    return this._files.length > 0;
  }

  progress() {
    const amountFiles = this._files.length;

    const progress = this._files.reduce((progress, file) => {
      return progress + (file.progress() / amountFiles);
    }, 0);

    return Math.round(progress * 100);
  }

  reset() {
    this._files = [];
  }
}

export default UploadService;