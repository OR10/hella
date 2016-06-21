import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
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

  it('should change height of loaded cuboid', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.HeightChange.StoreLabeledThingInFrame,
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
        browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.HeightChange.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should change move loaded cuboid without primary edge change', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.MovementLeft.StoreLabeledThingInFrame,
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
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementLeft.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should change move loaded cuboid with primary edge change', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 622, y: 390}) // move handle
          .mouseDown()
          .mouseMove(viewer, {x: 1000, y: 560}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementRight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementRight);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should rotate cuboid left around middle axis using keyboard', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.RotateKeyboardLeft.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .sendKeys('o')
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardLeft')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardLeft);
        browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.RotateKeyboardLeft.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should rotate cuboid right around middle axis using keyboard', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.RotateKeyboardRight.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .sendKeys('p')
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardRight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardRight);
        browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.RotateKeyboardRight.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should change width of loaded cuboid', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.WidthChange.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 507, y: 390}) // width handle
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChange);
        browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.WidthChange.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should change depth of loaded cuboid', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
      assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
      assets.mocks.CuboidDrawing.DepthChange.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 563, y: 353}) // initial position
          .click()
          .mouseMove(viewer, {x: 614, y: 379}) // depth handle
          .mouseDown()
          .mouseMove(viewer, {x: 800, y: 440}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChange);
        browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.CuboidDrawing.DepthChange.StoreLabeledThingInFrame);
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
