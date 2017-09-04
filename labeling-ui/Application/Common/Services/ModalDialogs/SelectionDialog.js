import selectionDialogTemplate from '../../Views/ModalDialogs/SelectionDialog.html!';

function selectionDialogProvider(ModalDialog) {
  /**
   * Simple information message dialog
   */
  return class SelectionDialog extends ModalDialog {
    /**
     * @param {{title: string?, headline: string?, message: string?, confirmButtonText: string?, cancelButtonText: string?, data: Array.<{id: string, name: string}>}?} content
     * @param {Function?} confirmCallback
     * @param {Function?} cancelCallback
     * @param {Object?} options
     *
     * The following content options are available:
     * - `title`
     * - `headline`
     * - `message`
     * - `data`: Object of `id` and `name`
     * - `defaultSelection`: Text which is displayed if no item was chosen yet.
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
        title: 'Selection required',
        heading: '',
        message: '',
        defaultSelection: 'Please make a selection',
        data: [],
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
      const augmentedData = [
        {name: this._content.defaultSelection},
      ].concat(this._content.data);

      return Object.assign(
        super.getScope(confirmCallback, cancelCallback),
        {
          data: augmentedData,
          selection: this._options.selected,
        }
      );
    }

    /**
     * Provide a angular based template for this dialog
     *
     * @returns {string}
     */
    getTemplate() {
      return selectionDialogTemplate;
    }
  };
}

selectionDialogProvider.$inject = [
  'ModalDialog',
];

export default selectionDialogProvider;
