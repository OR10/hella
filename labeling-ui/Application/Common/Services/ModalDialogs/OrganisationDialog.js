import organisationDialogTemplate from '../../Views/ModalDialogs/OrganisationDialog.html!';

function inputDialogProvider(ModalDialog) {
  /**
   * Simple confirmation message dialog
   */
  return class OrganisationDialog extends ModalDialog {
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
     * - `maxLength`: a number indicating the maximum number of characters which may be input by the user (default: 140)
     */
    constructor(content = {}, confirmCallback = null, cancelCallback = null, options = {}) {
      super(content, confirmCallback, cancelCallback, options);
    }

    /**
     * Provide default options for this dialog, if none are specified.
     *
     * @returns {Object}
     * @protected
     */
    _getDefaultOptions() {
      return Object.assign(super._getDefaultOptions(), {
        maxLength: 140,
      });
    }

    /**
     * Provide default content for this dialog, if none is specified.
     *
     * @returns {Object}
     * @protected
     */
    _getDefaultContent() {
      return Object.assign({}, super._getDefaultContent(), {
        title: 'Input required',
        heading: '',
        message: '',
        unit: 'mb',
        userQuota: 0,
      });
    }

    /**
     * Return the scope, which will be given to the dialog before it is created/shown.
     *
     * The scope is no angular scope, but a simple object containing the contents of template variables.
     * Therefore two-way or even single-way data binding is not possible. This is due to the way the underlying
     * foundation implementations handles dialogs.
     *
     * The confirm as well as cancel callback to be used inside the template are provided for each call to the method.
     * These callbacks must be used instead of the user defined ones, as further internal wiring is introduced.
     * The provided custom callbacks are guaranteed to be called within this wired functions.
     *
     * @param {Function} confirmCallback
     * @param {Function} cancelCallback
     * @returns {Object}
     */
    getScope(confirmCallback, cancelCallback) {
      return Object.assign(
        super.getScope(confirmCallback, cancelCallback),
        {
          maxLength: this._options.maxLength,
        }
      );
    }

    /**
     * Provide a angular based template for this dialog
     *
     * @returns {string}
     */
    getTemplate() {
      return organisationDialogTemplate;
    }
  };
}

inputDialogProvider.$inject = [
  'ModalDialog',
];

export default inputDialogProvider;
