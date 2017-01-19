describe('ModalDialog', () => {
  beforeEach(next => {
    return Promise.resolve()
      .then(() => browser.get('/modalDialog.html'))
      .then(() => browser.waitForAngular())
      .then(() => next());
  });

  describe('InfoDialog', () => {
    it('should show dialog with given title headline and message', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
        .then(() => element(by.css('.modal-body-headline')).getText()).then(result => expect(result).toEqual('Headline'))
        .then(() => element(by.css('.modal-body-content')).getText()).then(result => expect(result).toEqual('Message'))
        .then(() => next());
    });

    it('should be callable using shortcut on ModalService', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
          let injector = angular.element(document.body).injector();
          let modalService = injector.get('modalService');

          modalService.info({
            title: 'TITLE',
            headline: 'Headline',
            message: 'Message',
          });
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
        .then(() => element(by.css('.modal-body-headline')).getText()).then(result => expect(result).toEqual('Headline'))
        .then(() => element(by.css('.modal-body-content')).getText()).then(result => expect(result).toEqual('Message'))
        .then(() => next());
    });
  });

  it('should uppercase title', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
      .then(() => next());
  });

  it('should show confirm and cancel buttons by default', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-button-confirm')).getText()).then(result => expect(result).toEqual('OKAY'))
      .then(() => element(by.css('.modal-button-cancel')).getText()).then(result => expect(result).toEqual('CANCEL'))
      .then(() => next());
  });

  it('should show dialog with custom cancel and confirm button texts', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-button-confirm')).getText()).then(result => expect(result).toEqual('CUSTOM CONFIRM'))
      .then(() => element(by.css('.modal-button-cancel')).getText()).then(result => expect(result).toEqual('CUSTOM CANCEL'))
      .then(() => next());
  });

  it('should close dialog on cancel', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-button-cancel')).click())
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeFalsy())
      .then(() => next());
  });

  it('should close dialog on confirm', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => {
        element(by.css('.modal-button-confirm')).click();
      })
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeFalsy())
      .then(() => next());
  });

  it('should execute given callback on confirm', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
            function () { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = 'confirm';
            }
          )
        );
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-button-confirm')).click())
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => {
        expect(browser.executeScript(() => {
          return window.__FUNCTIONAL_TEST_MODAL;
        })).toEqual('confirm');
      })
      .then(() => next());
  });

  it('should execute given callback on cancel', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
            function () { // eslint-disable-line func-names
              window.__FUNCTIONAL_TEST_MODAL = 'cancel';
            }
          )
        );
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))

      .then(() => element(by.css('.modal-button-cancel')).click())
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => {
        expect(browser.executeScript(() => {
          return window.__FUNCTIONAL_TEST_MODAL;
        })).toEqual('cancel');
      })
      .then(() => next());
  });

  it('should show no cancel button if requested', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-button-cancel')).isPresent()).then(result => expect(result).toBeFalsy())
      .then(() => next());
  });

  it('should use "normal" css class by default', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-overlay.modal-dialog-normal')).isPresent()).then(result => expect(result).toBeTruthy())
      .then(() => next());
  });

  it('should use "warning" css class for warning dialog', next => {
    Promise.resolve()
      .then(() => browser.executeScript(() => {
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
      }))
      // Wait for the modal "animation"
      .then(() => browser.sleep(500))
      .then(() => element(by.css('.modal-overlay.modal-dialog-warning')).isPresent()).then(result => expect(result).toBeTruthy())
      .then(() => next());
  });

  describe('InputDialog', () => {
    it('should show dialog with given title headline and message', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
        .then(() => element(by.css('.modal-body-headline')).getText()).then(result => expect(result).toEqual('Headline'))
        .then(() => element(by.css('.modal-body-content')).getText()).then(result => expect(result).toEqual('Message'))
        .then(() => next());
    });

    it('should provide input element', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() =>browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => next());
    });

    it('should count characters element', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).sendKeys('Some input message'))
        .then(() => element(by.css('.modal-body .character-count')).getText()).then(result => expect(result).toEqual('18/140'))
        .then(() => next());
    });

    it('should allow configuration of maximal character count', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).sendKeys('Some input message'))
        .then(() => element(by.css('.modal-body .character-count')).getText()).then(result => expect(result).toEqual('18/42'))
        .then(() => next());
    });

    it('should mark input on >maxLength', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).sendKeys('Some padded input message XXXXXXXXXXXXXXXXXXXXXXX'))
        .then(() => element(by.css('.modal-body input.error')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => element(by.css('.modal-body .character-count')).getText()).then(result => expect(result).toEqual('49/42'))
        .then(() => next());
    });

    it('should disallow confirmation on input >maxLength', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).sendKeys('Some padded input message XXXXXXXXXXXXXXXXXXXXXXX'))
        .then(() => element(by.css('.modal-button-confirm')).click())
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
        .then(() => next());
    });

    it('should transport given message to confirmation callback', next => {
      Promise.resolve()
        .then(() => browser.executeScript(() => {
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
              function (message) { // eslint-disable-line func-names
                window.__FUNCTIONAL_TEST_MODAL = message;
              }
            )
          );
        }))
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => element(by.css('.modal-body input')).sendKeys('Some input message'))
        .then(() => element(by.css('.modal-button-confirm')).click())
        // Wait for the modal "animation"
        .then(() => browser.sleep(500))
        .then(() => {
          expect(browser.executeScript(() => {
            return window.__FUNCTIONAL_TEST_MODAL;
          })).toEqual('Some input message');
        })
        .then(() => next());
    });

    describe('ListDialog', () => {
      it('should show dialog with given title headline message and list entries', next => {
        Promise.resolve()
          .then(() => browser.executeScript(() => {
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
          }))
          // Wait for the modal "animation"
          .then(() => browser.sleep(500))
          .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
          .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
          .then(() => element(by.css('.modal-body-headline')).getText()).then(result => expect(result).toEqual('Headline'))
          .then(() => element(by.css('.modal-body-content')).getText()).then(result => expect(result).toEqual('Message'))
          .then(() => element(by.css('.modal-list > li:nth-child(1)')).getText()).then(result => expect(result).toEqual('List entry 1'))
          .then(() => element(by.css('.modal-list > li:nth-child(2)')).getText()).then(result => expect(result).toEqual('List entry 2'))
          .then(() => element(by.css('.modal-list > li:nth-child(3)')).getText()).then(result => expect(result).toEqual('List entry 3'))
          .then(() => next());
      });
    });

    describe('SelectionDialog', () => {
      it('should show dialog with given title headline message and selection entries', next => {
        Promise.resolve()
          .then(() => browser.executeScript(() => {
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
          }))
          // Wait for the modal "animation"
          .then(() => browser.sleep(500))
          .then(() => element(by.css('.modal.is-active')).isPresent()).then(result => expect(result).toBeTruthy())
          .then(() => element(by.css('.modal-title')).getText()).then(result => expect(result).toEqual('TITLE'))
          .then(() => element(by.css('.modal-body-headline')).getText()).then(result => expect(result).toEqual('Headline'))
          .then(() => element(by.css('.modal-body-content')).getText()).then(result => expect(result).toEqual('Message'))
          .then(() => element(by.css('.modal-select > option:nth-child(2)')).getAttribute('value')).then(result => expect(result).toEqual('one'))
          .then(() => element(by.css('.modal-select > option:nth-child(2)')).getText()).then(result => expect(result).toEqual('Selection entry 1'))
          .then(() => element(by.css('.modal-select > option:nth-child(3)')).getAttribute('value')).then(result => expect(result).toEqual('two'))
          .then(() => element(by.css('.modal-select > option:nth-child(3)')).getText()).then(result => expect(result).toEqual('Selection entry 2'))
          .then(() => element(by.css('.modal-select > option:nth-child(4)')).getAttribute('value')).then(result => expect(result).toEqual('three'))
          .then(() => element(by.css('.modal-select > option:nth-child(4)')).getText()).then(result => expect(result).toEqual('Selection entry 3'))
          .then(() => next());
      });

      it('should show "Please select..." text as first entry', next => {
        Promise.resolve()
          .then(() => browser.executeScript(() => {
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
          }))
          // Wait for the modal "animation"
          .then(() => browser.sleep(500))
          .then(() => element(by.css('.modal-select > option:nth-child(1)')).getAttribute('value')).then(result => expect(result).toEqual(''))
          .then(() => element(by.css('.modal-select > option:nth-child(1)')).getText()).then(result => expect(result).toEqual('Please make a selection'))
          .then(() => next());
      });

      it('should transport given selection to confirmation callback', next => {
        Promise.resolve()
          .then(() => browser.executeScript(() => {
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
                function (selection) { // eslint-disable-line func-names
                  window.__FUNCTIONAL_TEST_MODAL = selection;
                }
              )
            );
          }))
          // Wait for the modal "animation"
          .then(() => browser.sleep(500))
          .then(() => {
            element(by.css('.modal-select > option:nth-child(3)')).click();
            element(by.css('.modal-button-confirm')).click();
          })
          // Wait for the modal "animation"
          .then(() => browser.sleep(500))
          .then(() => {
            expect(browser.executeScript(() => {
              return window.__FUNCTIONAL_TEST_MODAL;
            })).toEqual('two');
          })
          .then(() => next());
      });
    });
  });
});
