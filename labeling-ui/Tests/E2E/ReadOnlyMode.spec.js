import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  shortSleep,
} from '../Support/Protractor/Helpers';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('ReadOnly Mode', () => {
  let assets;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.ReadOnlyMode.Shared.Task,
      assets.mocks.ReadOnlyMode.Shared.Video,
      assets.mocks.ReadOnlyMode.Shared.TaskConfiguration,
      assets.mocks.ReadOnlyMode.Shared.TaskConfigurationFile,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ]);

    viewer = element(by.css('.layer-container'));
  });

  describe('Existing Shape', () => {
    function clickRectangle() {
      return browser.actions()
        .mouseMove(viewer, {x: 150, y: 350})
        .click()
        .perform();
    }

    beforeEach(() => {
      bootstrapPouch([
        assets.documents.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should not show handles', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeHandles')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeHandles);
        })
        .then(() => done());
    });

    it('should not be movable by mouse', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeMovement')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeMovement);
        })
        .then(() => done());
    });

    it('should not be movable by keyboard', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .sendKeys(protractor.Key.ARROW_DOWN)
            .sendKeys(protractor.Key.ARROW_LEFT)
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.NULL)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.NULL)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.NULL)
            .perform();
        })
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeMovement')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeMovement);
        })
        .then(() => done());
    });

    it('should not be resizable', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 204, y: 428}) // Bottom right corner
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeResize')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeResize);
        })
        .then(() => done());
    });

    it('should not be removable by mouse', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          const deleteShapeButton = element(by.css('#delete-shape-button'));
          return expect(deleteShapeButton.isDisplayed()).toBeFalsy();
        })
        .then(() => done());
    });

    it('should not be removable by keyboard', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.DELETE)
            .perform();
        })
        .then(() => shortSleep())
        .then(() => expectAllModalsToBeClosed())
        .then(() => done());
    });

    it('should not be interpolatable by mouse', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          const interpolateShapeButton = element(by.css('#interpolate-shape-button'));
          return expect(interpolateShapeButton.isDisplayed()).toBeFalsy();
        })
        .then(() => done());
    });

    it('should not be interpolatable by keyboard', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .sendKeys('t') // Interpolation shortcut
            .perform();
        })
        .then(() => shortSleep())
        .then(() => expectAllModalsToBeClosed()) // Error modal regarding non mocked request
        .then(() => done());
    });
  });

  describe('New Shape', () => {
    let toolButton0;

    beforeEach(() => toolButton0 = element(by.css('button.tool-button.tool-thing.tool-0')));

    it('should not be possible to be created', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .click(toolButton0) // Rect drawing
            .perform();
        })
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 204, y: 428})
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoDrawingPossible')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoDrawingPossible);
        })
        .then(() => done());
    });
  });

  describe('Attribute on Shape', () => {
    let labelSelectorHelper;

    beforeEach(() => {
      bootstrapPouch([
        assets.documents.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0,
      ]);
    });

    beforeEach(() => {
      const labelSelector = element(by.css('label-selector'));
      labelSelectorHelper = new LabelSelectorHelper(labelSelector);
    });

    it('should not be changable', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Sign type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Sign type', 'U-Turn').click())
        .then(() => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Sign type')).toEqual(
          {
            'U-Turn': false,
            'Speed sign': false,
          }
        ))
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
