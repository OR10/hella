class UploadService {
  constructor() {
    this._files = [];
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
    let progress = 0;

    this._files.forEach(file => {
      progress += file.progress() / amountFiles;
    });

    return Math.round(progress * 100);
  }
}

export default UploadService;