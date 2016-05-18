import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {initApplication} from '../Support/Protractor/Helpers';
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
        () => canvasInstructionLogManager.getCanvasLogs()
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
        () => canvasInstructionLogManager.getCanvasLogs()
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
        () => canvasInstructionLogManager.getCanvasLogs()
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
        () => canvasInstructionLogManager.getCanvasLogs()
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
        () => canvasInstructionLogManager.getCanvasLogs()
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
        () => canvasInstructionLogManager.getCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontRight);
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
