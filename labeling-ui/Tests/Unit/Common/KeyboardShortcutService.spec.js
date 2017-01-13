import 'jquery';
import angular from 'angular';
import Common from 'Application/Common/Common';
import {module, inject} from 'angular-mocks';

import KeyboardShortcutService from 'Application/Common/Services/KeyboardShortcutService';

describe('KeyboardShortcutService', () => {
  let keyboardShortcutService;
  let hotkeys;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('hotkeys', {
        add: jasmine.createSpy('add').and.callFake(() => {
        }),
        del: jasmine.createSpy('add').and.callFake(() => {
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

  it('should add a hotkey an push the context', () => {
    const context = 'context';
    const hotkeyConfig = {combo: 'a'};

    keyboardShortcutService.addHotkey(context, hotkeyConfig);
    keyboardShortcutService.pushContext(context);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig);
  });

  it('should add hotkeys and push the context', () => {
    const context = 'context';
    const hotkeyConfig1 = {combo: 'a'};
    const hotkeyConfig2 = {combo: 'b'};

    keyboardShortcutService.addHotkey(context, hotkeyConfig1);
    keyboardShortcutService.addHotkey(context, hotkeyConfig2);
    keyboardShortcutService.pushContext(context);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig1);
    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig2);
  });

  it('should add hotkeys to different context and change the context', () => {
    const context1 = 'context';
    const context2 = 'context';
    const hotkeyConfig1 = {combo: 'a'};
    const hotkeyConfig2 = {combo: 'b'};

    keyboardShortcutService.addHotkey(context1, hotkeyConfig1);
    keyboardShortcutService.pushContext(context1);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig1);

    keyboardShortcutService.addHotkey(context2, hotkeyConfig2);
    keyboardShortcutService.pushContext(context2);

    expect(hotkeys.del).toHaveBeenCalledWith(hotkeyConfig1.combo);
    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig2);

    keyboardShortcutService.popContext(context2);

    expect(hotkeys.del).toHaveBeenCalledWith(hotkeyConfig2.combo);
    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig1);
  });

  it('should clear the context', () => {
    const context1 = 'context';
    const context2 = 'context';
    const hotkeyConfig1 = {combo: 'a'};
    const hotkeyConfig2 = {combo: 'b'};

    keyboardShortcutService.addHotkey(context1, hotkeyConfig1);
    keyboardShortcutService.pushContext(context1);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig1);

    keyboardShortcutService.addHotkey(context2, hotkeyConfig2);
    keyboardShortcutService.pushContext(context2);

    expect(hotkeys.del).toHaveBeenCalledWith(hotkeyConfig1.combo);
    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig2);

    keyboardShortcutService.clearContext(context1);

    expect(hotkeys.del).toHaveBeenCalledWith(hotkeyConfig1.combo);
    expect(hotkeys.del).toHaveBeenCalledWith(hotkeyConfig2.combo);

    expect(hotkeys.add).toHaveBeenCalledWith(hotkeyConfig2);
  });
});
