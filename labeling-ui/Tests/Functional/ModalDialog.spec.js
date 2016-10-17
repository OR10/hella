describe('ModalDialog', () => {
  beforeEach(next => {
    browser.get('/modalDialog.html').then(() => next());
  });

  describe('InfoDialog', () => {
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

  describe('InputDialog', () => {
    it('should show dialog with given title headline and message', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog({
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

    it('should provide input element', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-body input')).isPresent()).toBeTruthy();
    });

    it('should count characters element', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-body input')).sendKeys('Some input message');
      expect(element(by.css('.modal-body .character-count')).getText()).toEqual('18/140');
    });

    it('should allow configuration of maximal character count', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog(
            {
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            undefined,
            {
              maxLength: 42,
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-body input')).sendKeys('Some input message');
      expect(element(by.css('.modal-body .character-count')).getText()).toEqual('18/42');
    });

    it('should mark input on >maxLength', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog(
            {
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            undefined,
            {
              maxLength: 42,
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-body input')).sendKeys('Some padded input message XXXXXXXXXXXXXXXXXXXXXXX');
      expect(element(by.css('.modal-body input.error')).isPresent()).toBeTruthy();
      expect(element(by.css('.modal-body .character-count')).getText()).toEqual('49/42');
    });

    it('should disallow confirmation on input >maxLength', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        modalService.show(
          new InputDialog(
            {
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            undefined,
            undefined,
            {
              maxLength: 42,
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-body input')).sendKeys('Some padded input message XXXXXXXXXXXXXXXXXXXXXXX');

      element(by.css('.modal-button-confirm')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      // Dialog should still be there
      expect(element(by.css('.modal.is-active')).isPresent()).toBeTruthy();
    });

    it('should transport given message to confirmation callback', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let InputDialog = injector.get('InputDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new InputDialog(
            {
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
            },
            function(message) { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = message;
            }
          )
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-body input')).sendKeys('Some input message');
      element(by.css('.modal-button-confirm')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(browser.executeScript(() => {
        return window.__FUNCTIONAL_TEST_MODAL;
      })).toEqual('Some input message');
    });
  });

  describe('ListDialog', () => {
    it('should show dialog with given title headline message and list entries', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let ListDialog = injector.get('ListDialog');

        modalService.show(
          new ListDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
            data: [
              'List entry 1',
              'List entry 2',
              'List entry 3',
            ]
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeTruthy();
      expect(element(by.css('.modal-title')).getText()).toEqual('TITLE');
      expect(element(by.css('.modal-body-headline')).getText()).toEqual('Headline');
      expect(element(by.css('.modal-body-content')).getText()).toEqual('Message');

      expect(element(by.css('.modal-list > li:nth-child(1)')).getText()).toEqual('List entry 1');
      expect(element(by.css('.modal-list > li:nth-child(2)')).getText()).toEqual('List entry 2');
      expect(element(by.css('.modal-list > li:nth-child(3)')).getText()).toEqual('List entry 3');
    });
  });

  describe('SelectionDialog', () => {
    it('should show dialog with given title headline message and selection entries', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let SelectionDialog = injector.get('SelectionDialog');

        modalService.show(
          new SelectionDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
            data: [
              {id: 'one', name: 'Selection entry 1'},
              {id: 'two', name: 'Selection entry 2'},
              {id: 'three', name: 'Selection entry 3'},
            ],
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal.is-active')).isPresent()).toBeTruthy();
      expect(element(by.css('.modal-title')).getText()).toEqual('TITLE');
      expect(element(by.css('.modal-body-headline')).getText()).toEqual('Headline');
      expect(element(by.css('.modal-body-content')).getText()).toEqual('Message');

      expect(element(by.css('.modal-select > option:nth-child(2)')).getAttribute('value')).toEqual('one');
      expect(element(by.css('.modal-select > option:nth-child(2)')).getText()).toEqual('Selection entry 1');
      expect(element(by.css('.modal-select > option:nth-child(3)')).getAttribute('value')).toEqual('two');
      expect(element(by.css('.modal-select > option:nth-child(3)')).getText()).toEqual('Selection entry 2');
      expect(element(by.css('.modal-select > option:nth-child(4)')).getAttribute('value')).toEqual('three');
      expect(element(by.css('.modal-select > option:nth-child(4)')).getText()).toEqual('Selection entry 3');
    });

    it('should show "Please select..." text as first entry', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let SelectionDialog = injector.get('SelectionDialog');

        modalService.show(
          new SelectionDialog({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
            data: [
              {id: 'one', name: 'Selection entry 1'},
              {id: 'two', name: 'Selection entry 2'},
              {id: 'three', name: 'Selection entry 3'},
            ],
          })
        );
      });
      // Wait for the modal "animation"
      browser.sleep(500);

      expect(element(by.css('.modal-select > option:nth-child(1)')).getAttribute('value')).toEqual('');
      expect(element(by.css('.modal-select > option:nth-child(1)')).getText()).toEqual('Please make a selection');
    });

    it('should transport given selection to confirmation callback', () => {
      browser.executeScript(() => {
        let injector = angular.element(document.body).injector();
        let modalService = injector.get('modalService');
        let SelectionDialog = injector.get('SelectionDialog');

        window.__FUNCTIONAL_TEST_MODAL = false;

        modalService.show(
          new SelectionDialog(
            {
              title: 'TITLE',
              headline: 'Headline',
              message: 'Message',
              data: [
                {id: 'one', name: 'Selection entry 1'},
                {id: 'two', name: 'Selection entry 2'},
                {id: 'three', name: 'Selection entry 3'},
              ],
            },
            function(selection) { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = selection;
            }
          )
        );
      });

      // Wait for the modal "animation"
      browser.sleep(500);

      element(by.css('.modal-select > option:nth-child(3)')).click();
      element(by.css('.modal-button-confirm')).click();

      // Wait for the modal "animation"
      browser.sleep(500);

      expect(browser.executeScript(() => {
        return window.__FUNCTIONAL_TEST_MODAL;
      })).toEqual('two');
    });
  });
});
