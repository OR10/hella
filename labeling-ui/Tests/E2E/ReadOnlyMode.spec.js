import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('ReadOnly Mode', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
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
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .click()
            .perform();
        })
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

    it('should not be movable', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .click()
            .perform();
        })
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

    it('should not be resizable', done => {
      mock(sharedMocks);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 350})
            .click()
            .perform();
        })
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
        .then(() => browser.actions()
          .click(toolButton0) // Rect drawing
          .perform()
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

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
