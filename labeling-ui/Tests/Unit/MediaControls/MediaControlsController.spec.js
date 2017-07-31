import MediaControlsController from 'Application/MediaControls/Directives/MediaControlsController';

describe('MediaControlsController test suite', () => {
  /**
   * @Type {MediaControlsController}
   */
  let controller;

  beforeEach(() => {
    const scope = jasmine.createSpyObj('$scope', ['$watchGroup']);
    const rootScope = jasmine.createSpyObj('$rootScope', ['$on']);
    const applicationState = jasmine.createSpyObj('applicationState', ['$watch']);
    const keyboardShortcutService = jasmine.createSpyObj('keyboardShortcutService', ['addHotkey']);

    controller = new MediaControlsController(scope, rootScope, null, null, null, null, null, null, null, applicationState, null, keyboardShortcutService);
  });

  it('should be instantiable', () => {
    expect(controller instanceof MediaControlsController).toBe(true);
  });

  describe('playButtonVisible()', () => {
    it('Throws TypeError by default', () => {
      function throwWrapper() {
        controller.playButtonVisible();
      }
      expect(throwWrapper).toThrowError();
    });

    it('it returns true if not playing and no paperShape is selected', () => {
      controller.selectedPaperShape = null;
      const actual = controller.playButtonVisible();
      expect(actual).toBe(true);
    });

    it('returns false when playing is true and no shape is selected', () => {
      controller.selectedPaperShape = null;
      controller.playing = true;
      const actual = controller.playButtonVisible();
      expect(actual).toBe(false);
    });

    it('returns true if not playing and selectedPaperShape does not support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.selectedPaperShape.playInFrameRange.and.returnValue(false);
      const actual = controller.playButtonVisible();
      expect(actual).toBe(true);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns true if not playing and selectedPaperShape.playInFrameRange() returns undefined', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      const actual = controller.playButtonVisible();
      expect(actual).toBe(true);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns false if not playing and selectedPaperShape does support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.selectedPaperShape.playInFrameRange.and.returnValue(true);
      const actual = controller.playButtonVisible();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns false if playing and selectedPaperShape does not support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.playing = true;
      const actual = controller.playButtonVisible();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).not.toHaveBeenCalled();
    });

    it('returns false if playing and selectedPaperShape does support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.playing = true;
      const actual = controller.playButtonVisible();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).not.toHaveBeenCalled();
    });
  });

  describe('playButtonForFrame', () => {
    it('Throws TypeError by default', () => {
      function throwWrapper() {
        controller.playButtonForFrame();
      }
      expect(throwWrapper).toThrowError();
    });

    it('it returns false if not playing and no paperShape is selected', () => {
      controller.selectedPaperShape = null;
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
    });

    it('returns false when playing is true and no shape is selected', () => {
      controller.selectedPaperShape = null;
      controller.playing = true;
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
    });

    it('returns false if not playing and selectedPaperShape does not support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.selectedPaperShape.playInFrameRange.and.returnValue(false);
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns false if not playing and selectedPaperShape.playInFrameRange() returns undefined', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns true if not playing and selectedPaperShape does support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.selectedPaperShape.playInFrameRange.and.returnValue(true);
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(true);
      expect(controller.selectedPaperShape.playInFrameRange).toHaveBeenCalledTimes(1);
    });

    it('returns false if playing and selectedPaperShape does not support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.playing = true;
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).not.toHaveBeenCalled();
    });

    it('returns false if playing and selectedPaperShape does support playInFrameRange', () => {
      controller.selectedPaperShape = jasmine.createSpyObj('selectedPaperShape', ['playInFrameRange']);
      controller.playing = true;
      const actual = controller.playButtonForFrame();
      expect(actual).toBe(false);
      expect(controller.selectedPaperShape.playInFrameRange).not.toHaveBeenCalled();
    });
  });
});
