import infoDialogTemplate from '../../Views/ModalDialogs/InfoDialog.html!';

function infoDialogProvider(ModalDialog) {
  /**
   * Simple information message dialog
   */
  return class InfoDialog extends ModalDialog {
    /**
     * @param {{title: string?, headline: string?, message: string?, confirmButtonText: string?, cancelButtonText: string?}?} content
     * @param {Function?} confirmCallback
     * @param {Function?} cancelCallback
     * @param {Object?} options
     *
     * The following content options are available:
     * - `title`
     * - `headline`
     * - `message`
     * - `confirmButtonText`
     * - `cancelButtonText`
     *
     * Optionally the following options may be specified:
     * - `warning`: a flag indicating that the dialog should be styled in a more aggressive manner
     * - `abortable`: a flag indicating whether the dialog may be dismissed without action by using a cancel button,
     *    or pressing ESC.
     */
    constructor(content = {}, confirmCallback = null, cancelCallback = null, options = {}) {
      super(content, confirmCallback, cancelCallback, options);
    }

    /**
     * Provide default content for this dialog, if none is specified.
     *
     * @returns {Object}
     * @protected
     */
    _getDefaultContent() {
      return Object.assign({}, super._getDefaultContent(), {
        title: 'Information',
        heading: '',
        message: '',
      });
    }

    /**
     * Provide a angular based template for this dialog
     *
     * @returns {string}
     */
    getTemplate() {
      return infoDialogTemplate;
    }
  };
}

infoDialogProvider.$inject = [
  'ModalDialog',
];

export default infoDialogProvider;
