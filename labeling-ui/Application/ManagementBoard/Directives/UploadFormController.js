import {debounce} from 'lodash';

/**
 * Controller of the {@link UploadFormDirective}
 */
class UploadFormController {
  /**
   * @param {$state} $state
   * @param {UploadGateway} uploadGateway
   * @param {ModalService} modalService
   * @param {ListDialog.constructor} ListDialog
   * @param {OrganisationService} organisationService
   * @param {InProgressService} inProgressService
   * @param {angular.$timeout} $timeout
   * @param {UploadService} uploadService
   */
  constructor($state, uploadGateway, modalService, ListDialog, organisationService, inProgressService, $timeout, uploadService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {Function}
     */
    // Flow seems to fire this callback multiple times upon completion. No idea why.
    this.uploadComplete = debounce(() => this._uploadComplete(), 500, {leading: true, trailing: false});

    /**
     * @type {UploadGateway}
     * @private
     */
    this._uploadGateway = uploadGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ListDialog}
     * @private
     */
    this._ListDialog = ListDialog;

    /**
     * @type {InProgressService}
     * @private
     */
    this._inProgressService = inProgressService;

    /**
     * @type {angular.$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {UploadService}
     * @private
     */
    this._uploadService = uploadService;

    /**
     * @type {boolean}
     */
    this.uploadInProgress = false;

    /**
     * @type {string}
     */
    this.targetPath = this._uploadGateway.getApiUrl(this.uploadPath);

    /**
     * @type {null|Function}
     * @private
     */
    this._unregisterUiRouterInterception = null;

    /**
     * @type {string}
     */
    this.currentOrganisationId = organisationService.get();

    this.$flow = null;

    organisationService.subscribe(newOrganisation => {
      this.currentOrganisationId = newOrganisation.id;
    });
  }

  _uploadComplete() {
    this._uploadGateway.markUploadAsFinished(this.uploadCompletePath)
      .then(
        result => {
          this.uploadInProgress = false;
          this._inProgressService.end();
          if (result.error !== undefined) {
            this._showErrorsModal(result.error.message);
          } else if (this._hasFilesWithError()) {
            this._showCompletedWithErrorsModal(result.missing3dVideoCalibrationData);
          } else {
            this._showCompletedModal(result.missing3dVideoCalibrationData);
          }
          this._removeFilesAndHideProgressBarAfter();
        }
      )
      .catch(
        () => {
          this.uploadInProgress = false;
          this._inProgressService.end();
          this._showCompletedWithErrorsModal([]);
          this._removeFilesAndHideProgressBarAfter();
        }
      );
  }

  _hasFilesWithError() {
    return this.$flow.files
      .reduce((before, file) => before || file.hasUploadError(), false);
  }

  _showCompletedWithErrorsModal(incompleteVideos) {
    if (incompleteVideos.length > 1) {
      this._modalService.show(
        new this._ListDialog(
          {
            title: 'Upload completed with errors',
            headline: 'Your upload is complete, but errors occured.',
            message: 'Some errors occurred during your upload. Please check the file list for errors and act accordingly. ' +
            'Some of the uploaded videos are missing calibration data. Please upload the calibration data for the following videos:',
            confirmButtonText: 'Understood',
            data: incompleteVideos,
          },
          undefined,
          undefined,
          {
            abortable: false,
            warning: false,
          }
        )
      );
    } else {
      this._showErrorsModal('Some errors occurred during your upload. Please check the file list for errors and act accordingly.');
    }
  }

  _removeFilesAndHideProgressBarAfter(timeout=60000) {
    this._$timeout(() =>  {
      if (!this.uploadInProgress) {
        this._uploadService.reset();
      }
    }, timeout)
  }

  _showErrorsModal(message) {
    this._modalService.info(
      {
        title: 'Upload completed with errors',
        headline: 'Your upload is complete, but errors occured.',
        message: message.split('\\n'),
        confirmButtonText: 'Understood',
      },
      undefined,
      undefined,
      {
        abortable: false,
        warning: true,
      }
    );
  }

  _showCompletedModal(incompleteVideos) {
    if (incompleteVideos.length > 0) {
      this._modalService.show(
        new this._ListDialog(
          {
            title: 'Upload complete',
            headline: 'Your upload is complete',
            message: 'Your upload is complete but some of the calibration data is missing. Please upload the calibration data for the following videos:',
            confirmButtonText: 'Understood',
            data: incompleteVideos,
          },
          undefined,
          undefined,
          {
            abortable: false,
          }
        )
      );

      return;
    }

    this._modalService.info(
      {
        title: 'Upload complete',
        headline: 'Your upload is complete',
        message: this.uploadCompleteMessage,
        confirmButtonText: 'Go to Project List',
      },
      () => this._$state.go('labeling.projects.list')
    );
  }

  uploadStarted() {
    this.uploadInProgress = true;
    this._inProgressService.start('Upload is in progress!');
  }

  fileAdded(file) {
    file.hasUploadError = () => false;
    this._uploadService.addFile(file);
  }

  filesAdded(files) {
    files.forEach(file => this.fileAdded(file));
  }

  fileError(file, message) {
    file.errorMessage = JSON.parse(message).error;
    file.hasUploadError = () => true;
  }

  fileColorClass(file) {
    let fileColorClass = '';

    if (!file.isUploading() && file.isComplete() && file.hasUploadError()) {
      fileColorClass = 'upload-error';
    } else if (!file.isUploading() && file.isComplete()) {
      fileColorClass = 'upload-success';
    }

    return fileColorClass;
  }

  uploadFilesFromSystem() {
    this._$timeout(
        () => document.getElementById('project-upload-input').click()
    );
  }

  clearFiles() {
    this.$flow.cancel();
    this._uploadService.reset();
  }
}

UploadFormController.$inject = [
  '$state',
  'uploadGateway',
  'modalService',
  'ListDialog',
  'organisationService',
  'inProgressService',
  '$timeout',
  'uploadService',
];

export default UploadFormController;
