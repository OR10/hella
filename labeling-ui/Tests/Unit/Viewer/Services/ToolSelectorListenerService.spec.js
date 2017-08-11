import ToolSelectorListenerService from 'Application/Common/Services/ToolSelectorListenerService';

fdescribe('ToolSelectorListenerService tests', () => {
  it('can be created', () => {
    const service = new ToolSelectorListenerService();
    expect(service).toEqual(jasmine.any(ToolSelectorListenerService));
  });

  describe('addListener', () => {
    it('returns an identifier', () => {
      const service = new ToolSelectorListenerService();

      const identifierOne = service.addListener(() => {});
      const identifierTwo = service.addListener(() => {});

      expect(identifierOne).toEqual('ToolSelectorListenerService#1');
      expect(identifierTwo).toEqual('ToolSelectorListenerService#2');
    });
  });

  describe('trigger', () => {
    it('calls all the listeners, passing the correct parameters', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const callbackTwo = jasmine.createSpy('Callback 2');
      const oldStruct = { shape: 'old-shape', task: {} };
      const newStruct = { shape: 'new-shape', task: {} };

      service.addListener(callbackTwo);
      service.addListener(callbackOne);
      service.trigger(newStruct, oldStruct);

      expect(callbackOne).toHaveBeenCalledWith('new-shape', newStruct, oldStruct);
      expect(callbackTwo).toHaveBeenCalledWith('new-shape', newStruct, oldStruct);
    });

    it('passes null, if no old labelStructureObject given', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const callbackTwo = jasmine.createSpy('Callback 2');
      const newStruct = { shape: 'new-shape', task: {} };

      service.addListener(callbackTwo);
      service.addListener(callbackOne);
      service.trigger(newStruct);

      expect(callbackOne).toHaveBeenCalledWith('new-shape', newStruct, null);
      expect(callbackTwo).toHaveBeenCalledWith('new-shape', newStruct, null);
    });

    it('only triggers for a specific tool, if defined', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const callbackTwo = jasmine.createSpy('Callback 2');
      const newStruct = { shape: 'new-shape', task: {} };

      service.addListener(callbackTwo, 'foo-shape');
      service.addListener(callbackOne, 'new-shape');
      service.trigger(newStruct);

      expect(callbackOne).toHaveBeenCalledWith('new-shape', newStruct, null);
      expect(callbackTwo).not.toHaveBeenCalled();
    });

    it('does not immediately call the last trigger if there was none', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');

      service.addListener(callbackOne, null, true);

      expect(callbackOne).not.toHaveBeenCalled();
    });

    it('does immediately call the last trigger if there was one', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const newStruct = { shape: 'new-shape', task: {} };

      service.trigger(newStruct);
      service.addListener(callbackOne, null, true);

      expect(callbackOne).toHaveBeenCalledWith('new-shape', newStruct, null);
    });

    it('does  immediately call the last trigger was for the passed tool', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const newStruct = { shape: 'new-shape', task: {} };

      service.trigger(newStruct);
      service.addListener(callbackOne, 'new-shape', true);

      expect(callbackOne).toHaveBeenCalledWith('new-shape', newStruct, null);
    });

    it('does not immediately call the last trigger if there was one but for the wrong tool', () => {
      const service = new ToolSelectorListenerService();
      const callbackOne = jasmine.createSpy('Callback 1');
      const newStruct = { shape: 'new-shape', task: {} };

      service.trigger(newStruct);
      service.addListener(callbackOne, 'other-shape', true);

      expect(callbackOne).not.toHaveBeenCalled();
    });
  });

  describe('getClass()', () => {
    it('returns the classname', () => {
      expect(ToolSelectorListenerService.getClass()).toEqual('ToolSelectorListenerService');
    });
  });
});
