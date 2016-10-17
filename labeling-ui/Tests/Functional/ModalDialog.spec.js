describe('ModalDialog', () => {
  describe('Info', () => {
    beforeEach(next => {
      browser.get('/modalDialog.html').then(() => next());
    });

    it('should show dialog with given title headline and message', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeTruthy();
      expect(element(by.css('.modal-title')).getText()).toEqual('TITLE');
      expect(element(by.css('.modal-body-headline')).getText()).toEqual('Headline');
      expect(element(by.css('.modal-body-content')).getText()).toEqual('Message');
    });

    it('should be callable using shortcut on ModalService', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');

        modalService.info({
          title: 'TITLE',
          headline: 'Headline',
          message: 'Message',
        });
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeTruthy();
      expect(element(by.css('.modal-title')).getText()).toEqual('TITLE');
      expect(element(by.css('.modal-body-headline')).getText()).toEqual('Headline');
      expect(element(by.css('.modal-body-content')).getText()).toEqual('Message');
    });

    it('should uppercase title', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'Title',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-title')).getText()).toEqual('TITLE');
    });

    it('should show confirm and cancel buttons by default', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-button-confirm')).getText()).toEqual('OKAY');
      expect(element(by.css('.modal-button-cancel')).getText()).toEqual('CANCEL');
    });

    it('should show dialog with custom cancel and confirm button texts', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
            confirmButtonText: 'CUSTOM CONFIRM',
            cancelButtonText: 'CUSTOM CANCEL',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-button-confirm')).getText()).toEqual('CUSTOM CONFIRM');
      expect(element(by.css('.modal-button-cancel')).getText()).toEqual('CUSTOM CANCEL');
    });

    it('should close dialog on cancel', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-button-cancel')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeFalsy();
    });

    it('should close dialog on confirm', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-button-confirm')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeFalsy();
    });

    it('should execute given callback on confirm', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InfoDialog({
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            function() { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = 'confirm';
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-button-confirm')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(browser.executeScript(() => {
        return window.__FUNCTIONAL_TEST_MODAL;
      })).toEqual('confirm');
    });

    it('should execute given callback on cancel', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InfoDialog({
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            function() { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = 'cancel';
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-button-cancel')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(browser.executeScript(() => {
        return window.__FUNCTIONAL_TEST_MODAL;
      })).toEqual('cancel');
    });

    it('should show no cancel button if requested', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InfoDialog({
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            undefined,
            {
              abortable: false,
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-button-cancel')).isPresent()).toBeFalsy();
    });

    it('should use "normal" css class by default', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InfoDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-overlay.modal-dialog-normal')).isPresent()).toBeTruthy();
    });

    it('should use "warning" css class for warning dialog', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InfoDialog = injector.get('InfoDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InfoDialog({
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            undefined,
            {
              warning: true,
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-overlay.modal-dialog-warning')).isPresent()).toBeTruthy();
    });
  });
});
