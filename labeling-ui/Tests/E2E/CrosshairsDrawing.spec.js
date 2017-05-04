import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Mouse Crosshair', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let crosshairsToggleButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Task,
      assets.mocks.Shared.Video,
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
    crosshairsToggleButton = element(by.css('.task-bar-right button .fa-crosshairs')).element(by.xpath('..'));
  });

  it('should not show crosshair if it is disabled', done => {
    mock(sharedMocks.concat([
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .perform();
      })
      .then(
        () => canvasInstructionLogManager.getCrosshairsCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CrosshairsDrawing.NoCrosshairs);
        done();
      });
  });

  it('should show crosshair if it is enabled (position top left)', done => {
    mock(sharedMocks.concat([
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .click(crosshairsToggleButton)
          .mouseMove(viewer, {x: 20, y: 20})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getCrosshairsCanvasLogs('CrosshairsDrawing', 'TopLeft')
        () => canvasInstructionLogManager.getCrosshairsCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CrosshairsDrawing.TopLeft);
        done();
      });
  });

  it('should show crosshair if it is enabled (position center)', done => {
    mock(sharedMocks.concat([
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .click(crosshairsToggleButton)
          .mouseMove(viewer, {x: 1024 / 2, y: 620 / 2})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getCrosshairsCanvasLogs('CrosshairsDrawing', 'Center')
        () => canvasInstructionLogManager.getCrosshairsCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CrosshairsDrawing.Center);
        done();
      });
  });

  it('should show crosshair if it is enabled (position bottom right)', done => {
    mock(sharedMocks.concat([
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .click(crosshairsToggleButton)
          .mouseMove(viewer, {x: 1024 - 20, y: 620 - 20})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getCrosshairsCanvasLogs('CrosshairsDrawing', 'BottomRight')
        () => canvasInstructionLogManager.getCrosshairsCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CrosshairsDrawing.BottomRight);
        done();
      });
  });

  it('should not show crosshair if it is enabled and mousecursor is outside of the viewer', done => {
    mock(sharedMocks.concat([
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.CrosshairsDrawing.Shared.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .click(crosshairsToggleButton)
          .mouseMove(viewer, {x: 200, y: 200})
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 100, y: -50})
          .perform();
      })
      .then(
        () => canvasInstructionLogManager.getCrosshairsCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CrosshairsDrawing.NoCrosshairs);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
