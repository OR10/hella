import infoModalTemplate from './ModalService/InfoModal.html!';
import warningModalTemplate from './ModalService/WarningModal.html!';
import alertModalTemplate from './ModalService/AlertModal.html!';

/**
 * Service providing an interface to create modal dialog windows
 */
class ModalService {
  constructor(ModalFactory) {
    this._ModalFactory = ModalFactory;
    this._modal = undefined;
  }

  _createModal(modalClass, template, scope, confirmCallback, cancelCallback) {
    const {message, headline, title, confirmButtonText, cancelButtonText} = scope;
    const noop = () => {};
    const onConfirm = confirmCallback || noop;
    const onCancel = cancelCallback || noop;

    if(this._modal && this._modal.isActive()){
      throw new Error('Only one modal at a time is allowed open');
    }

    this._modal = new this._ModalFactory(
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
            this._modal.deactivate();
            this._modalOpen = false;
            onCancel();
            setTimeout(
              () => {
                this._modal.destroy();
              }, 1000
            );
          },
          confirmCallback: () => {
            this._modal.deactivate();
            this._modalOpen = false;
            onConfirm();
            setTimeout(
              () => {
                this._modal.destroy();
              }, 1000
            );
          },
        },
      }
    );

    return this._modal;
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
}

ModalService.$inject = ['ModalFactory'];

export default ModalService;
