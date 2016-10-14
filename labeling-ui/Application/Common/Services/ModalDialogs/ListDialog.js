import listDialogTemplate from '../../Views/ModalDialogs/ListDialog.html!';

function listDialogProvider(ModalDialog) {
  /**
   * Simple information message dialog
   */
  return class ListDialog extends ModalDialog {
    /**
     * @param {{title: string?, headline: string?, message: string?, confirmButtonText: string?, cancelButtonText: string?, data: Array.<string>}?} content
     * @param {Function?} confirmCallback
     * @param {Function?} cancelCallback
     * @param {Object?} options
     *
     * The following content options are available:
     * - `title`
     * - `headline`
     * - `message`
     * - `data`
     * - `confirmButtonText`
     * - `cancelButtonText`
     *
     * Optionally the following options may be specified:
     * - `warning`: a flag indicating that the dialog should be styled in a more aggressive manner
     */
    constructor(content, confirmCallback = null, cancelCallback = null, options = {}) {
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
        data: [],
      });
    }

    /**
     * Provide a angular based template for this dialog
     *
     * @returns {string}
     */
    getTemplate() {
      return listDialogTemplate;
    }
  };
}

listDialogProvider.$inject = [
  'ModalDialog',
];

export default listDialogProvider;
