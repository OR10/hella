import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  initApplication
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cuboid', () => {
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

  describe('Drawing', () => {
    it('should load and draw one rectangle in the back center', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackCenter')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackCenter);
          done();
        });
    });

    it('should load and draw one rectangle in the back left', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackLeft);
          done();
        });
    });

    it('should load and draw one rectangle in the back right', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackRight);
          done();
        });
    });

    it('should load and draw one rectangle in the front center', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenter')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenter);
          done();
        });
    });

    it('should load and draw one rectangle in the front left', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontLeft);
          done();
        });
    });

    it('should load and draw one rectangle in the front right', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontRight);
          done();
        });
    });

    it('should load and draw one rectangle in the front center rotated right by 45°', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight45')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight45);
          done();
        });
    });

    it('should load and draw one rectangle in the front center rotated right by 225°', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight225')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight225);
          done();
        });
    });
  });

  describe('Transformation', () => {
    it('should change height of loaded cuboid', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        assets.mocks.CuboidDrawing.HeightChange.StoreLabeledThingInFrame,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 564, y: 222}) // height handle
            .mouseDown()
            .mouseMove(viewer, {x: 564, y: 402}) // drag
            .mouseUp()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChange')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
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

    it('should not allow the height to become negative', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        assets.mocks.CuboidDrawing.HeightChangeNonNegative.StoreLabeledThingInFrame,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 564, y: 222}) // height handle
            .mouseDown()
            .mouseMove(viewer, {x: 564, y: 600}) // drag
            .mouseUp()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeNonNegative')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeNonNegative);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.HeightChangeNonNegative.StoreLabeledThingInFrame);
          done();
        });
    });

    it('should change move loaded cuboid without primary edge change', done => {
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
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementLeft);
          browser.sleep(1000);
        })
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementLeft.StoreLabeledThingInFrame);
          done();
        });
    });

    it('should change move loaded cuboid with primary edge change', done => {
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
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementRight);
          browser.sleep(1000);
        })
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame);
          done();
        });
    });

    it('should rotate cuboid left around middle axis using keyboard', done => {
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
        .then(drawingStack => {
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

    it('should rotate cuboid right around middle axis using keyboard', done => {
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
        .then(drawingStack => {
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

    it('should change width of loaded cuboid', done => {
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
        .then(drawingStack => {
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

    it('should change depth of loaded cuboid', done => {
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
        .then(drawingStack => {
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
  });

  describe('Pseudo3d', () => {
    it('should switch to 2d mode and back if back is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFramePseudo3d,
        assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFrameReal3d,
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
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFramePseudo3d);
        })
        .then(() => {
          browser.actions()
            .sendKeys('p')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFrameReal3d);
          done();
        });
    });

    it('should switch to 2d mode and back if front is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFramePseudo3d,
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFrameReal3d,
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
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth180);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFramePseudo3d);
        })
        .then(() => {
          browser.actions()
            .sendKeys('o')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth180);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFrameReal3d);
          done();
        });
    });

    it('should switch to 2d mode and back if left side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFramePseudo3d,
        assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFrameReal3d,
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
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFramePseudo3d);
        })
        .then(() => {
          browser.actions()
            .sendKeys('p')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFrameReal3d);
          done();
        });
    });

    it('should switch to 2d mode and back if right side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFramePseudo3d,
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFrameReal3d,
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
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth180);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFramePseudo3d);
        })
        .then(() => {
          browser.actions()
            .sendKeys('o')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth180);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFrameReal3d);
          done();
        });
    });

    it('should switch to 2d mode and back if rotated around primary axis by handle', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.StoreLabeledThingInFramePseudo3d,
        assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.StoreLabeledThingInFrameReal3d,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 624, y: 431})
            .mouseDown()
            .mouseMove(viewer, {x: 589, y: 429})
            .mouseUp()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepthHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepthHandle);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.StoreLabeledThingInFramePseudo3d);
        })
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 385, y: 465})
            .mouseDown()
            .mouseMove(viewer, {x: 357, y: 380})
            .mouseUp()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepthHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepthHandle);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dDepthHandle.StoreLabeledThingInFrameReal3d);
          done();
        });
    });

    it('should switch to 2d mode if height is changed above visual threshold', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0to4,
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.StoreLabeledThingInFramePseudo3d,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 622, y: 328}) // height handle
            .mouseDown()
            .mouseMove(viewer, {x: 622, y: 158}) // drag
            .mouseUp()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dHeightHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dHeightHandle);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.StoreLabeledThingInFramePseudo3d);
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
