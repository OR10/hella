import angular from 'angular';

/**
 * Service providing an interface to create modal dialog windows
 */
class ModalService {
  /**
   * @param {ModalFactory} ModalFactory
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {InfoDialog} InfoDialog
   */
  constructor(ModalFactory, keyboardShortcutService, InfoDialog) {
    /**
     * @private
     */
    this._ModalFactory = ModalFactory;

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {InfoDialog}
     * @private
     */
    this._InfoDialog = InfoDialog;

    /**
     * @type {boolean}
     * @private
     */
    this._modalOpen = false;
  }

  /**
   * @param {ModalDialog} dialog
   * @returns {Object}
   * @private
   */
  _createModal(dialog) {
    if (this._modalOpen) {
      throw new Error('Only one modal at a time is allowed open');
    }

    const cancelCallback = dialog.getCancelCallback();
    const confirmCallback = dialog.getConfirmCallback();

    let modal;

    const safelyDestroyModal = () => {
      // Wait until the animation has finished and the modal has disappeared before really destroying it.
      setTimeout(
        () => {
          modal.destroy();
        }, 1000
      );
    };

    const cancelCallbackWrapper = data => {
      modal.deactivate();
      this._modalOpen = false;
      this._keyboardShortcutService.removeOverlayById('modal');
      cancelCallback(data);
      safelyDestroyModal();
    };

    const confirmCallbackWrapper = data => {
      modal.deactivate();
      this._modalOpen = false;
      this._keyboardShortcutService.removeOverlayById('modal');
      confirmCallback(data);
      safelyDestroyModal();
    };

    // Create the modal using Foundations modal module
    modal = new this._ModalFactory({
      class: dialog.getCssClass(),
      overlay: true,
      overlayClose: 'false', // This actually needs to be a string
      template: dialog.getTemplate(),
      animationIn: 'slideInDown',
      overlayIn: 'fadeIn',
      contentScope: dialog.getScope(confirmCallbackWrapper, cancelCallbackWrapper),
    });

    return {modal, cancelCallbackWrapper, confirmCallbackWrapper};
  }

  /**
   *
   * @param {ModalDialog} dialog
   */
  show(dialog) {
    const {modal, cancelCallbackWrapper} = this._createModal(dialog);

    this._keyboardShortcutService.registerOverlay('modal', true);

    if (dialog.getOptions.abortable === true) {
      this._keyboardShortcutService.addHotkey('modal', {
        combo: 'esc',
        description: 'Close the modal',
        callback: cancelCallbackWrapper,
      });
    }

    this._keyboardShortcutService.addHotkey('modal', {
      combo: ['tab', 'shift+tab'],
      description: 'Select the other button in the dialog',
      callback: event => {
        // Select the other button in the modal that is not in focus
        angular.element(document.body).find('button:focus').parent().find('button:not(:focus)').focus();
        event.preventDefault();
      },
    });

    this._modalOpen = true;
    modal.activate();

    // @Hack: Autofocus seems not to work and direct selection of the element is also not possible
    // in the same Frame. Therefore the almighty setTimeout comes to save the day...
    setTimeout(() => angular.element(document.body).find('.modal.is-active button.modal-button-confirm').focus(), 50);
  }

  // Shortcuts to mostly used Dialog types

  /**
   * Create and show an Info Dialog
   *
   * See {@link InfoDialog} for details
   *
   * @param {{title: string?, headline: string?, message: string?, confirmButtonText: string?, cancelButtonText: string?}|undefined} content
   * @param {Function|undefined} confirmCallback
   * @param {Function|undefined} cancelCallback
   * @param {Object|undefined} options
   */
  info(content, confirmCallback, cancelCallback, options) {
    this.show(new this._InfoDialog(content, confirmCallback, cancelCallback, options));
  }
}

ModalService.$inject = [
  'ModalFactory',
  'keyboardShortcutService',
  'InfoDialog',
];

export default ModalService;
