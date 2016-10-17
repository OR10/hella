function modalDialogProvider() {
  /**
   * Base class for all ModalDialog configurations
   *
   * @abstract
   */
  return class ModalDialog {
    /**
     * Create base dialog.
     *
     * Every ModalDialog may have a confirm and/or cancel callback function, which is executed, once the user
     * interacted with the dialog. Both callbacks are optional and may be `null`.
     *
     * @param {Object?} content
     * @param {Function?} confirmCallback
     * @param {Function?} cancelCallback
     * @param {Object?} options
     *
     * Optionally the following options may be specified:
     * - `warning`: a flag indicating that the dialog should be styled in a more aggressive manner
     * - `abortable`: a flag indicating whether the dialog may be dismissed without action by using a cancel button,
     *    or pressing ESC.
     */
    constructor(content = {}, confirmCallback = null, cancelCallback = null, options = {}) {
      /**
       * @type {Object}
       * @protected
       */
      this._content = Object.assign({}, this._getDefaultContent(), content);

      /**
       * @type {Function|null}
       * @private
       */
      this._confirmCallback = confirmCallback;

      /**
       * @type {Function|null}
       * @private
       */
      this._cancelCallback = cancelCallback;

      /**
       * @type {Object}
       * @protected
       */
      this._options = Object.assign({}, this._getDefaultOptions(), options);
    }

    /**
     * Provide default content for this dialog, if none is specified.
     *
     * @returns {Object}
     * @protected
     */
    _getDefaultContent() {
      return {
        confirmButtonText: 'Okay',
        cancelButtonText: 'Cancel',
      };
    }

    /**
     * Provide default options for this dialog, if none are specified.
     *
     * @returns {Object}
     * @protected
     */
    _getDefaultOptions() {
      return {
        warning: false,
        abortable: true,
      };
    }

    /**
     * Get the options assigned to this dialog.
     *
     * @returns {Object}
     */
    getOptions() {
      return Object.assign({}, this._options);
    }

    /**
     * Return a specific css class for this dialog.
     *
     * The CSS class is encasing the the whole dialog inside the HTML representation and may be used for specific
     * styling of certain dialog instances.
     *
     * @returns {string}
     */
    getCssClass() {
      return this._options.warning ? 'modal-dialog-warning' : 'modal-dialog-normal';
    }

    /**
     * Provide the confirm callback, which is to be executed once the user interacted with the dialog.
     *
     * This function returns a valid function in every case. A noop function is valid of course.
     *
     * @returns {Function}
     */
    getConfirmCallback() {
      if (this._confirmCallback === null) {
        return () => {
          // noop
        };
      }
      return this._confirmCallback;
    }

    /**
     * Provide the cancel callback, which is to be executed once the user interacted with the dialog.
     *
     * This function returns a valid function in every case. A noop function is valid of course.
     *
     * @returns {Function}
     */
    getCancelCallback() {
      if (this._cancelCallback === null) {
        return () => {
          // noop
        };
      }
      return this._cancelCallback;
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
     *
     * @param {Function} confirmCallback
     * @param {Function} cancelCallback
     * @returns {Object}
     */
    getScope(confirmCallback, cancelCallback) {
      return Object.assign(
        {},
        this._content,
        {
          isAbortable: this._options.abortable,
          confirmCallback,
          cancelCallback,
        }
      );
    }

    /**
     * Provide a angular based template for this dialog
     *
     * @returns {string}
     * @abstract
     */
    getTemplate() {
      throw new Error('getTemplate is abstract. Override in implementing class!');
    }
  };
}

modalDialogProvider.$inject = [];

export default modalDialogProvider;
