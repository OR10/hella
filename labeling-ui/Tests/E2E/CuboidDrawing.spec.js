import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {dumpAllRequestsMade, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cuboid drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Task,
      assets.mocks.CuboidDrawing.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one rectangle in the back center', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackCenter')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackCenter);
        done();
      });
  });

  it('should load and draw one rectangle in the back left', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackLeft')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackLeft);
        done();
      });
  });

  it('should load and draw one rectangle in the back right', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackRight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackRight);
        done();
      });
  });

  it('should load and draw one rectangle in the front center', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenter')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenter);
        done();
      });
  });

  it('should load and draw one rectangle in the front left', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontLeft')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontLeft);
        done();
      });
  });

  it('should load and draw one rectangle in the front right', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontRight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontRight);
        done();
      });
  });

  it('should load and draw one rectangle in the front center rotated right by 45°', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight45')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight45);
        done();
      });
  });

  it('should load and draw one rectangle in the front center rotated right by 225°', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0,
      assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight225')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight225);
        done();
      });
  });

  it('should change height of loaded cuboid (without request checking)', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 621, y: 330}) // height handle
          .mouseDown()
          .mouseMove(viewer, {x: 621, y: 50}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChange);
        done();
      });
  });

  it('should change move loaded cuboid without primary edge change (without request checking)', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 622, y: 390}) // move handle
          .mouseDown()
          .mouseMove(viewer, {x: 235, y: 560}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementLeft')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementLeft);
        done();
      });
  });

  // Currently broken
  xit('should change move loaded cuboid with primary edge change (without request checking)', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 622, y: 390}) // move handle
          .mouseDown()
          .mouseMove(viewer, {x: 850, y: 616}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementRight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementRight);
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
