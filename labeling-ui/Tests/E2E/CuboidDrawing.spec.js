import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  initApplication,
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
      assets.mocks.CuboidDrawing.Shared.Task,
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
    describe('Height', () => {
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

      it('should adhere to minimalHeight of loaded cuboid', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
          assets.mocks.CuboidDrawing.HeightChangeMinimal.StoreLabeledThingInFrame,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 564, y: 222}) // height handle
              .mouseDown()
              .mouseMove(viewer, {x: 564, y: 448}) // drag
              .mouseUp()
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeMinimal')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeMinimal);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.HeightChangeMinimal.StoreLabeledThingInFrame);
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
    });

    describe('Position', () => {
      it('should move loaded cuboid without primary edge change', done => {
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
          // .then(() => dumpAllRequestsMade(mock))
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
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame);
            done();
          });
      });

      it('should limit movement at the horizon', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
          assets.mocks.CuboidDrawing.MovementHorizonLimit.StoreLabeledThingInFrame,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 565, y: 469}) // initial position
              .mouseDown()
              .mouseMove(viewer, {x: 691, y: 348}) // drag
              .mouseUp()
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementHorizonLimit')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementHorizonLimit);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.MovementHorizonLimit.StoreLabeledThingInFrame);
          })
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 691, y: 348}) // drag
              .mouseDown()
              .mouseMove(viewer, {x: 691, y: 100}) // drag
              .mouseUp()
              .perform();
          })
          .then(
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementHorizonLimit);
            done();
          });
      });
    });

    describe('Rotation', () => {
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

      it('should fast rotate cuboid right around middle axis using keyboard', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
          assets.mocks.CuboidDrawing.RotateKeyboardShiftRight.StoreLabeledThingInFrame,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .keyDown(protractor.Key.SHIFT)
              .sendKeys('p')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftRight);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.RotateKeyboardShiftRight.StoreLabeledThingInFrame);
            done();
          });
      });

      it('should fast rotate cuboid left around middle axis using keyboard', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
          assets.mocks.CuboidDrawing.RotateKeyboardShiftLeft.StoreLabeledThingInFrame,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .keyDown(protractor.Key.SHIFT)
              .sendKeys('o')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftLeft);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.RotateKeyboardShiftLeft.StoreLabeledThingInFrame);
            done();
          });
      });
    });

    describe('Width', () => {
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
    });

    describe('Depth', () => {
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
              .mouseMove(viewer, {x: 613, y: 376}) // depth handle
              .mouseDown()
              .mouseMove(viewer, {x: 568, y: 331}) // drag
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

    describe('Orientation', () => {
      it('should flip faces clockwise using keyboard', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame1,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame2,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame3,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame4,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('ß')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise1);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame1);
          })
          .then(() => {
            browser.actions()
              .sendKeys('ß')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise2);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame2);
          })
          .then(() => {
            browser.actions()
              .sendKeys('ß')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise3);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame3);
          })
          .then(() => {
            browser.actions()
              .sendKeys('ß')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise4);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame4);
            done();
          });
      });

      it('should flip faces counter clockwise using keyboard', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame1,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame2,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame3,
          assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame4,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(() => {
            browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('0')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise1);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame1);
          })
          .then(() => {
            browser.actions()
              .sendKeys('0')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise2);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame2);
          })
          .then(() => {
            browser.actions()
              .sendKeys('0')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise3);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame3);
          })
          .then(() => {
            browser.actions()
              .sendKeys('0')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise4);
            browser.sleep(1000);
          })
          // .then(() => dumpAllRequestsMade(mock))
          .then(() => getMockRequestsMade(mock))
          .then(requests => {
            expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame4);
            done();
          });
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

    it('should flip faces clockwise using keyboard', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0to4,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame1,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame2,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame3,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('ß')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise1);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame1);
        })
        .then(() => {
          browser.actions()
            .sendKeys('ß')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise2);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame2);
        })
        .then(() => {
          browser.actions()
            .sendKeys('ß')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise3);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame3);
        })
        .then(() => {
          browser.actions()
            .sendKeys('ß')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise4);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame4);
          done();
        });
    });

    it('should flip faces counter clockwise using keyboard', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0to4,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame1,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame2,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame3,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame4,
      ]));

      initApplication('/labeling/task/TASKID-TASKID')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('0')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise1);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame1);
        })
        .then(() => {
          browser.actions()
            .sendKeys('0')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise2);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame2);
        })
        .then(() => {
          browser.actions()
            .sendKeys('0')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise3);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame3);
        })
        .then(() => {
          browser.actions()
            .sendKeys('0')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise4);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame4);
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
