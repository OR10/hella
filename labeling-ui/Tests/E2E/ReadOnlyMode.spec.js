import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication, mock} from '../Support/Protractor/Helpers';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('ReadOnly Mode', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
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
    ];

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
      sharedMocks = sharedMocks.concat([
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0,
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.getLabeledThingInFrame1,
      ]);
    });

    it('should not show handles', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeHandles')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeHandles);
          done();
        });
    });

    it('should not be movable by mouse', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeMovement')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeMovement);
          done();
        });
    });

    it('should not be movable by keyboard', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .sendKeys(protractor.Key.ARROW_DOWN)
            .sendKeys(protractor.Key.ARROW_LEFT)
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.SHIFT)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.SHIFT)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.SHIFT)
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.SHIFT)
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeMovement')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeMovement);
          done();
        });
    });

    it('should not be resizable', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 204, y: 428}) // Bottom right corner
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoShapeResize')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoShapeResize);
          done();
        });
    });

    it('should not be removable by mouse', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          const deleteShapeButton = element(by.css('#delete-shape-button'));
          return expect(deleteShapeButton.isDisplayed()).toBeFalsy();
        })
        .then(() => done());
    });

    it('should not be removable by keyboard', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.DELETE)
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(() => expectAllModalsToBeClosed())
        .then(() => done());
    });

    it('should not be interpolatable by mouse', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          const interpolateShapeButton = element(by.css('#interpolate-shape-button'));
          return expect(interpolateShapeButton.isDisplayed()).toBeFalsy();
        })
        .then(() => done());
    });

    it('should not be interpolatable by keyboard', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangle())
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .sendKeys('t') // Interpolation shortcut
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(() => expectAllModalsToBeClosed()) // Error modal regarding non mocked request
        .then(() => done());
    });
  });

  describe('New Shape', () => {
    let toolButton0;

    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.ReadOnlyMode.Empty.LabeledThingInFrame.frameIndex0,
        assets.mocks.ReadOnlyMode.Empty.LabeledThingInFrame.frameIndex0to4,
      ]);
    });

    beforeEach(() => toolButton0 = element(by.css('button.tool-button.tool-0')));

    it('should not be possible to be created', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .click(toolButton0) // Rect drawing
            .perform()
          }
        )
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 204, y: 428})
            .mouseDown()
            .mouseMove(viewer, {x: 450, y: 550})
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ReadOnlyMode', 'NoDrawingPossible')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ReadOnlyMode.NoDrawingPossible);
          done();
        });
    });
  });

  describe('Attribute on Shape', () => {
    let labelSelectorHelper;

    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0,
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.ReadOnlyMode.Display.LabeledThingInFrame.getLabeledThingInFrame1,
      ]);
    });

    beforeEach(() => {
      const labelSelector = element(by.css('label-selector'));
      labelSelectorHelper = new LabelSelectorHelper(labelSelector);
    });

    it('should not be changable', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .click()
            .perform();
        })
        .then(() => browser.sleep(250))
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
    mock.teardown();
  });
});
