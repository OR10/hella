import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  mock,
  sendKeySequences,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cuboid Drawing', () => {
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
      assets.mocks.Shared.Thumbnails.cuboidLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  describe('Drawing', () => {
    it('should load and draw one cuboid in the back center', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackCenter')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackCenter);
          done();
        });
    });

    it('should load and draw one cuboid in the back left', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackLeft);
          done();
        });
    });

    it('should load and draw one cuboid in the back right', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'BackRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.BackRight);
          done();
        });
    });

    it('should load and draw one cuboid in the front center', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenter')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenter);
          done();
        });
    });

    it('should load and draw one cuboid in the front left', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontLeft);
          done();
        });
    });

    it('should load and draw one cuboid in the front right', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontRight);
          done();
        });
    });

    it('should load and draw one cuboid in the front center rotated right by 45°', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight45')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight45);
          done();
        });
    });

    it('should load and draw one cuboid in the front center rotated right by 225°', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateRight225')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateRight225);
          done();
        });
    });

    it('should load and draw one cuboid in the front center rotated where the top side is overlapping the deepest vertex', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FrontCenterRotateVeryLow.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.FrontCenterRotateVeryLow.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FrontCenterRotateVeryLow')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FrontCenterRotateVeryLow);
          done();
        });
    });
  });

  describe('DepthBuffer', () => {
    const keySequences = [protractor.Key.SHIFT, 'pppppp', protractor.Key.NULL];

    it('should properly render a cuboid with low height from all sides', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.DepthBufferVeryLow.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidDrawing.DepthBufferVeryLow.LabeledThingInFrame.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 596, y: 496})
            .click()
            .perform();
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow1);
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow2);
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow3);
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame4).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow4);
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame5).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow5')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow5);
        })
        .then(() => sendKeySequences(keySequences))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame6).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow6')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow6);
        })
        .then(() => {
          done()
        });
    });
  });

  describe('Transformation', () => {
    describe('Height', () => {
      it('should change height of loaded cuboid', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 564, y: 222}) // height handle
              .mouseDown()
              .mouseMove(viewer, {x: 564, y: 402}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChange.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChange);
          })
          .then(() => {
            done();
          });
      });

      it('should adhere to minimalHeight of loaded cuboid', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 564, y: 222}) // height handle
              .mouseDown()
              .mouseMove(viewer, {x: 564, y: 448}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeMinimal.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeMinimal')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeMinimal);
          })
          .then(() => {
            done()
          });
      });

      it('should not allow the height to become negative', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 564, y: 222}) // height handle
              .mouseDown()
              .mouseMove(viewer, {x: 564, y: 600}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeNonNegative.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeNonNegative')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeNonNegative);
          })
          .then(() => {
            done()
          });
      });

      it('should add to height of loaded cuboid by keyboard', done => {
        const keySequences = ['88888888888888888888'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardAdd);
          })
          .then(() => {
            done()
          });
      });

      it('should substract from height of loaded cuboid by keyboard', done => {
        const keySequences = ['22222222222222222222'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardSubstract')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardSubstract);
          })
          .then(() => {
            done()
          });
      });

      it('should add to height of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '88888888888888888888888888888888888888', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardAddFast);
          })
          .then(() => {
            done()
          });
      });

      it('should substract from height of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '22222', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardSubstractFast);
          })
          .then(() => {
            done()
          });
      });
    });

    describe('Position', () => {
      it('should move loaded cuboid without primary edge change', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 622, y: 390}) // move handle
              .mouseDown()
              .mouseMove(viewer, {x: 235, y: 560}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementLeft.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementLeft);
          })
          .then(() => {
            done()
          });
      });

      it('should move loaded cuboid with primary edge change', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 622, y: 390}) // move handle
              .mouseDown()
              .mouseMove(viewer, {x: 1000, y: 560}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementRight);
          })
          .then(() => {
            done();
          });
      });

      it('should limit movement at the horizon', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 565, y: 469}) // initial position
              .mouseDown()
              .mouseMove(viewer, {x: 691, y: 348}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementHorizonLimit.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementHorizonLimit')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementHorizonLimit);
          })
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 691, y: 348}) // drag
              .mouseDown()
              .mouseMove(viewer, {x: 691, y: 100}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementHorizonLimit);
          })
          .then(() => {
            done()
          });
      });

      it('should limit movement if the height is below the minimal height', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 565, y: 469}) // initial position
              .mouseDown()
              .mouseMove(viewer, {x: 690, y: 350}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementMinimalHeightLimit.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementMinimalHeightLimit')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementMinimalHeightLimit);
          })
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 690, y: 350}) // drag
              .mouseDown()
              .mouseMove(viewer, {x: 690, y: 319}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementMinimalHeightLimit);
          })
          .then(() => {
            done();
          });
      });
    });

    describe('Rotation', () => {
      it('should rotate cuboid left around middle axis using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('o')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardLeft.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardLeft);
          })
          .then(() => {
            done();
          });
      });

      it('should rotate cuboid right around middle axis using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('p')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardRight.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardRight);
          })
          .then(() => {
            done();
          });
      });

      it('should fast rotate cuboid left around middle axis using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys(protractor.Key.SHIFT)
              .sendKeys('o')
              .sendKeys(protractor.Key.NULL)
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftLeft);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardShiftLeft.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(() => {
            done();
          });
      });

      it('should fast rotate cuboid right around middle axis using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys(protractor.Key.SHIFT)
              .sendKeys('p')
              .sendKeys(protractor.Key.NULL)
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardShiftRight.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftRight);
          })
          .then(() => {
            done();
          });
      });
    });

    describe('Width', () => {
      it('should change width of loaded cuboid', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 507, y: 390}) // width handle
              .mouseDown()
              .mouseMove(viewer, {x: 400, y: 500}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChange.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChange);
          })
          .then(() => {
            done();
          });
      });

      it('should add to width of loaded cuboid by keyboard', done => {
        const keySequences = ['44444444444444444444'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardAdd);
          })
          .then(() => {
            done();
          });
      });

      it('should substract from width of loaded cuboid by keyboard', done => {
        const keySequences = ['66666666666666666666'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardSubstract')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardSubstract);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(() => {
            done();
          });
      });

      it('should add to width of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '44444444444444444444', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardAddFast);
          })
          .then(() => {
            done();
          });
      });

      it('should substract from width of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '66666', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardSubstractFast);
          })
          .then(() => {
            done();
          });
      });
    });

    describe('Depth', () => {
      it('should change depth of loaded cuboid', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .mouseMove(viewer, {x: 613, y: 376}) // depth handle
              .mouseDown()
              .mouseMove(viewer, {x: 568, y: 331}) // drag
              .mouseUp()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChange.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChange);
          })
          .then(() => {
            done();
          });
      });

      it('should add to depth of loaded cuboid by keyboard', done => {
        const keySequences = ['9999999999'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardAdd);
          })
          .then(() => {
            done();
          });
      });

      it('should substract from depth of loaded cuboid by keyboard', done => {
        const keySequences = ['3333333333'];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardSubstract')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardSubstract);
          })
          .then(() => {
            done();
          });
      });

      it('should add to depth of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '99', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardAddFast);
          })
          .then(() => {
            done();
          });
      });

      it('should substract from depth of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '33', protractor.Key.NULL];

        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardSubstractFast);
          })
          .then(() => {
            done();
          });
      });
    });

    describe('Orientation', () => {
      it('should flip faces clockwise using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('i')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise1);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise2);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise3);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise4);
          })
          .then(() => {
            done();
          });
      });

      it('should flip faces counter clockwise using keyboard shortcuts', done => {
        mock(sharedMocks.concat([
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
          assets.mocks.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0to4,
        ]));

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('u')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise1);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise2);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise3);
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(() => browser.sleep(500))
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise4);
          })
          .then(() => {
            done();
          });
      });
    });
  });

  describe('Pseudo3d', () => {
    it('should switch to 2d mode and back to 3d if back side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .perform();
        })
        .then(() => sendKeySequences(['oo']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth);
        })
        .then(() => sendKeySequences(['pp']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth);
        })
        .then(() => {
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if front side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .perform();
        })
        .then(() => sendKeySequences(['ppp']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth180);
        })
        .then(() => sendKeySequences(['oo']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth180);
        })
        .then(() => {
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if left side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .perform();
        })
        .then(() => sendKeySequences(['pp']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth);
        })
        .then(() => sendKeySequences(['oo']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth);
        })
        .then(() => {
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if right side is not visible', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .perform();
        })
        .then(() => sendKeySequences(['ppp']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth180);
        })
        .then(() => sendKeySequences(['oo']))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth180);
        })
        .then(() => {
          done();
        });
    });

    it('should switch to 2d mode if height is changed to above the visual threshold', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .mouseMove(viewer, {x: 622, y: 328}) // height handle
            .mouseDown()
            .mouseMove(viewer, {x: 622, y: 158}) // drag
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dHeightHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dHeightHandle);
        })
        .then(() => {
          done();
        });
    });

    it('should flip faces clockwise using keyboard shortcuts', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('i')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise1);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise2);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise3);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise4);
        })
        .then(() => {
          done();
        });
    });

    it('should flip faces counter clockwise using keyboard shortcuts', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('u')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise1);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise2);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise3);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(() => browser.sleep(500))
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise4);
        })
        .then(() => {
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
