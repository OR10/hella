import 'jquery';
import angular from 'angular';
import Common from 'Application/Common/Common';
import {module, inject} from 'angular-mocks';

import KeyboardShortcutService from 'Application/Common/Services/KeyboardShortcutService';

describe('KeyboardShortcutService', () => {
  let keyboardShortcutService;
  let hotkeys;
  let registeredHotkeys;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    registeredHotkeys = [];
    module($provide => {
      $provide.value('hotkeys', {
        add: jasmine.createSpy('add').and.callFake(hotkeyConfig => {
          registeredHotkeys.push(hotkeyConfig);
        }),
        del: jasmine.createSpy('del').and.callFake(combo => {
          const indexToDelete = registeredHotkeys.findIndex(candidate => candidate.combo === combo);
          if (indexToDelete !== -1) {
            registeredHotkeys.splice(indexToDelete, 1);
          }
        }),
      });

      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      keyboardShortcutService = $injector.get('keyboardShortcutService');
      hotkeys = $injector.get('hotkeys');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(keyboardShortcutService instanceof KeyboardShortcutService).toEqual(true);
  });

  it('should allow registration of non-blocking overlay', () => {
    const overlayIdentifier = 'some-overlay';
    const hotkeyConfig = {combo: 'a'};

    keyboardShortcutService.registerOverlay(overlayIdentifier, false);
    expect(
      keyboardShortcutService.isOverlayRegistered(overlayIdentifier)
    ).toBeTruthy();
  });

  it('should allow registration of blocking overlay', () => {
    const overlayIdentifier = 'some-overlay';
    const hotkeyConfig = {combo: 'a'};

    keyboardShortcutService.registerOverlay(overlayIdentifier, true);
    expect(
      keyboardShortcutService.isOverlayRegistered(overlayIdentifier)
    ).toBeTruthy();
  });

  it('should allow registration of a shortcut', () => {
    const overlayIdentifier = 'some-overlay';
    const hotkeyConfig = {combo: 'a'};

    keyboardShortcutService.registerOverlay(overlayIdentifier);
    keyboardShortcutService.addHotkey(overlayIdentifier, hotkeyConfig);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig);
  });

  it('should allow registration of multiple shortcuts in one overlay', () => {
    const overlayIdentifier = 'some-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};

    keyboardShortcutService.registerOverlay(overlayIdentifier);
    keyboardShortcutService.addHotkey(overlayIdentifier, hotkeyConfigA);
    keyboardShortcutService.addHotkey(overlayIdentifier, hotkeyConfigB);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigA,
      hotkeyConfigB
    ]);
  });

  it('should merge non blocking overlays', () => {
    const overlayIdentifierA = 'first-overlay';
    const overlayIdentifierB = 'second-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};

    keyboardShortcutService.registerOverlay(overlayIdentifierA, false);
    keyboardShortcutService.addHotkey(overlayIdentifierA, hotkeyConfigA);
    keyboardShortcutService.registerOverlay(overlayIdentifierB, false);
    keyboardShortcutService.addHotkey(overlayIdentifierB, hotkeyConfigB);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigA,
      hotkeyConfigB
    ]);
  });

  it('should overwrite using blocking overlays', () => {
    const overlayIdentifierA = 'first-overlay';
    const overlayIdentifierB = 'second-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};

    keyboardShortcutService.registerOverlay(overlayIdentifierA, false);
    keyboardShortcutService.addHotkey(overlayIdentifierA, hotkeyConfigA);
    keyboardShortcutService.registerOverlay(overlayIdentifierB, true);
    keyboardShortcutService.addHotkey(overlayIdentifierB, hotkeyConfigB);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigB
    ]);
  });

  it('should remove topmost overlay upon request', () => {
    const overlayIdentifierA = 'first-overlay';
    const overlayIdentifierB = 'second-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};

    keyboardShortcutService.registerOverlay(overlayIdentifierA, false);
    keyboardShortcutService.addHotkey(overlayIdentifierA, hotkeyConfigA);
    keyboardShortcutService.registerOverlay(overlayIdentifierB, false);
    keyboardShortcutService.addHotkey(overlayIdentifierB, hotkeyConfigB);

    keyboardShortcutService.removeOverlayById(overlayIdentifierB);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigA
    ]);
  });

  it('should remove lower level overlay upon request', () => {
    const overlayIdentifierA = 'first-overlay';
    const overlayIdentifierB = 'second-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};

    keyboardShortcutService.registerOverlay(overlayIdentifierA, false);
    keyboardShortcutService.addHotkey(overlayIdentifierA, hotkeyConfigA);
    keyboardShortcutService.registerOverlay(overlayIdentifierB, false);
    keyboardShortcutService.addHotkey(overlayIdentifierB, hotkeyConfigB);

    keyboardShortcutService.removeOverlayById(overlayIdentifierA);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigB
    ]);
  });

  it('should only merge down to the first blocking overlay', () => {
    const overlayIdentifierA = 'first-overlay';
    const overlayIdentifierB = 'second-overlay';
    const overlayIdentifierC = 'third-overlay';
    const hotkeyConfigA = {combo: 'a'};
    const hotkeyConfigB = {combo: 'b'};
    const hotkeyConfigC = {combo: 'c'};

    keyboardShortcutService.registerOverlay(overlayIdentifierA, false);
    keyboardShortcutService.addHotkey(overlayIdentifierA, hotkeyConfigA);
    keyboardShortcutService.registerOverlay(overlayIdentifierB, true);
    keyboardShortcutService.addHotkey(overlayIdentifierB, hotkeyConfigB);
    keyboardShortcutService.registerOverlay(overlayIdentifierC, false);
    keyboardShortcutService.addHotkey(overlayIdentifierC, hotkeyConfigC);

    expect(registeredHotkeys).toEqual([
      hotkeyConfigB,
      hotkeyConfigC
    ]);
  });
});
