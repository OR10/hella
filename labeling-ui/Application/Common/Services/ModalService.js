import infoModalTemplate from './ModalService/InfoModal.html!';
import warningModalTemplate from './ModalService/WarningModal.html!';

/**
 * Service providing an interface to create modal dialog windows
 */
class ModalService {
  constructor(ModalFactory) {
    this._ModalFactory = ModalFactory;
  }

  _createModal(modalClass, template, scope, confirmCallback, cancelCallback) {
    const {message, headline, title, confirmButtonText, cancelButtonText} = scope;
    const noop = () => {};
    const onConfirm = confirmCallback || noop;
    const onCancel = cancelCallback || noop;

    const modal = new this._ModalFactory(
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
          confirmButtonText,
          cancelButtonText,
          cancelCallback: () => {
            modal.deactivate();
            onCancel();
            setTimeout(
              () => {
                modal.destroy();
              }, 1000
            );
          },
          confirmCallback: () => {
            modal.deactivate();
            onConfirm();
            setTimeout(
              () => {
                modal.destroy();
              }, 1000
            );
          },
        },
      }
    );

    return modal;
  }

  getInfoDialog(scope, confirmCallback, cancelCallback) {
    return this._createModal('modal-info', infoModalTemplate, scope, cancelCallback, confirmCallback);
  }

  getWarningDialog(scope, confirmCallback, cancelCallback) {
    return this._createModal('modal-warning', warningModalTemplate, scope, cancelCallback, confirmCallback);
  }
}

ModalService.$inject = ['ModalFactory'];

export default ModalService;
