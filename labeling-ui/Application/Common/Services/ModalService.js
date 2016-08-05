import infoModalTemplate from './ModalService/InfoModal.html!';
import warningModalTemplate from './ModalService/WarningModal.html!';
import alertModalTemplate from './ModalService/AlertModal.html!';
import selectionModalTemplate from './ModalService/SelectionModal.html!';
import angular from 'angular';

/**
 * Service providing an interface to create modal dialog windows
 */
class ModalService {
  constructor(ModalFactory, keyboardShortcutService) {
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
     * @type {boolean}
     * @private
     */
    this._modalOpen = false;
  }

  _createModal(modalClass, template, scope, confirmCallback, cancelCallback) {
    const {message, headline, title, confirmButtonText, cancelButtonText} = scope;
    const selectionData = [{name: 'Please make a selection'}].concat(scope.selectionData);

    const noop = () => {
    };
    const onConfirm = confirmCallback || noop;
    const onCancel = cancelCallback || noop;

    if (this._modalOpen) {
      throw new Error('Only one modal at a time is allowed open');
    }

    let modal;

    const cancelCallbackWrapper = () => {
      modal.deactivate();
      this._modalOpen = false;
      this._keyboardShortcutService.popContext();
      this._keyboardShortcutService.clearContext('modal');
      onCancel();
      setTimeout(
        () => {
          modal.destroy();
        }, 1000
      );
    };

    modal = new this._ModalFactory(
      {
        class: modalClass,
        overlay: true,
        overlayClose: 'false', // This actually needs to be a string
        template,
        animationIn: 'slideInDown',
        overlayIn: 'fadeIn',
        contentScope: {
          message,
          headline,
          title,
          selectionData,
          confirmButtonText,
          cancelButtonText,
          cancelCallback: cancelCallbackWrapper,
          confirmCallback: selection => {
            modal.deactivate();
            this._modalOpen = false;
            this._keyboardShortcutService.popContext();
            this._keyboardShortcutService.clearContext('modal');
            onConfirm(selection);
            setTimeout(
              () => {
                modal.destroy();
              }, 1000
            );
          },
        },
      }
    );


    return {
      activate: () => {
        this._keyboardShortcutService.addHotkey('modal', {
          combo: 'esc',
          description: 'Close the modal',
          callback: cancelCallbackWrapper,
        });

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
        this._keyboardShortcutService.pushContext('modal');
        modal.activate();

        // @Hack: Autofocus seems not to work and direkt selection of the element is also not possible
        // in the same Frame. Therefore the almighty setTimeout comes to save the day...
        setTimeout(() => angular.element(document.body).find('.modal.is-active button.modal-button-confirm').focus(), 50);
      },
    };
  }

  getInfoDialog(scope, confirmCallback, cancelCallback) {
    return this._createModal('modal-info', infoModalTemplate, scope, confirmCallback, cancelCallback);
  }

  getWarningDialog(scope, confirmCallback, cancelCallback) {
    return this._createModal('modal-warning', warningModalTemplate, scope, confirmCallback, cancelCallback);
  }

  getAlertWarningDialog(scope, confirmCallback) {
    return this._createModal('modal-warning', alertModalTemplate, scope, confirmCallback);
  }

  getSelectionDialog(scope, confirmCallback, cancelCallback) {
    return this._createModal('modal-selection', selectionModalTemplate, scope, confirmCallback, cancelCallback);
  }
}

ModalService.$inject = ['ModalFactory', 'keyboardShortcutService'];

export default ModalService;
