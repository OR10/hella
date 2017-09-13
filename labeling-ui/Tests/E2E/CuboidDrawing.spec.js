import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapPouch,
  bootstrapHttp,
  sendKeySequences,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('Cuboid Drawing', () => {
  let assets;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    bootstrapHttp([
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
    ]);

    viewer = element(by.css('.layer-container'));
  });

  describe('Drawing', () => {
    it('should load and draw one cuboid in the back center', done => {
      bootstrapPouch([
        assets.documents.CuboidDrawing.BackCenter.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.BackLeft.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.BackRight.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontCenter.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontLeft.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontRight.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontCenterRotateRight45.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontCenterRotateRight225.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.FrontCenterRotateVeryLow.LabeledThingInFrame.frameIndex0,
      ]);

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
      bootstrapPouch([
        assets.documents.CuboidDrawing.DepthBufferVeryLow.LabeledThingInFrame.frameIndex0,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 596, y: 496})
            .click()
            .perform();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow1);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow2);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow3);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow4);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame4).toExistInPouchDb();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow5')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow5);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame5).toExistInPouchDb();
        })
        .then(() => sendKeySequences(keySequences))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthBufferVeryLow6')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthBufferVeryLow6);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.DepthBufferVeryLow.StoreLabeledThingInFrame6).toExistInPouchDb();
          done();
        });
    });
  });

  describe('Transformation', () => {
    describe('Height', () => {
      it('should change height of loaded cuboid', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChange);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChange.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should adhere to minimalHeight of loaded cuboid', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeMinimal')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeMinimal);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeMinimal.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should not allow the height to become negative', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeNonNegative')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeNonNegative);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeNonNegative.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to height of loaded cuboid by keyboard', done => {
        const keySequences = ['88888888888888888888'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardAdd);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from height of loaded cuboid by keyboard', done => {
        const keySequences = ['22222222222222222222'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardSubstract')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardSubstract);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to height of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '88888888888888888888888888888888888888', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          // Currently I have no idea why this is needed.
          .then(() => browser.sleep(3000))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardAddFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from height of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '22222', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'HeightChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.HeightChangeKeyboardSubstractFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.HeightChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });
    });

    describe('Position', () => {
      it('should move loaded cuboid without primary edge change', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementLeft);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementLeft.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should move loaded cuboid with primary edge change', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementRight);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementRight.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should limit movement at the horizon', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
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
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementHorizonLimit.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
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

      it('should limit movement if the height is below the minimal height', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 565, y: 469}) // initial position
              .mouseDown()
              .mouseMove(viewer, {x: 690, y: 350}) // drag
              .mouseUp()
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'MovementMinimalHeightLimit')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementMinimalHeightLimit);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.MovementMinimalHeightLimit.StoreLabeledThingInFrame).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 690, y: 350}) // drag
              .mouseDown()
              .mouseMove(viewer, {x: 690, y: 319}) // drag
              .mouseUp()
              .perform();
          })
          .then(
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.MovementMinimalHeightLimit);
            done();
          });
      });
    });

    describe('Rotation', () => {
      it('should rotate cuboid left around middle axis using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
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
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardLeft.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should rotate cuboid right around middle axis using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
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
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardRight.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should fast rotate cuboid left around middle axis using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftLeft')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftLeft);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardShiftLeft.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should fast rotate cuboid right around middle axis using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'RotateKeyboardShiftRight')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.RotateKeyboardShiftRight);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.RotateKeyboardShiftRight.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });
    });

    describe('Width', () => {
      it('should change width of loaded cuboid', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChange);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChange.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to width of loaded cuboid by keyboard', done => {
        const keySequences = ['44444444444444444444'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardAdd);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from width of loaded cuboid by keyboard', done => {
        const keySequences = ['66666666666666666666'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to width of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '44444444444444444444', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          // Currently I have no idea why this is needed.
          .then(() => browser.sleep(3000))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardAddFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from width of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '66666', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'WidthChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.WidthChangeKeyboardSubstractFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.WidthChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });
    });

    describe('Depth', () => {
      it('should change depth of loaded cuboid', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

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
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChange')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChange);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChange.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to depth of loaded cuboid by keyboard', done => {
        const keySequences = ['9999999999'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardAdd')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardAdd);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardAdd.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from depth of loaded cuboid by keyboard', done => {
        const keySequences = ['3333333333'];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardSubstract')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardSubstract);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardSubstract.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should add to depth of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '99', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => browser.sleep(250))
          .then(() => sendKeySequences(keySequences))
          .then(() => browser.sleep(250))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardAddFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardAddFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardAddFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });

      it('should substract from depth of loaded cuboid by keyboard in fast mode', done => {
        const keySequences = [protractor.Key.SHIFT, '33', protractor.Key.NULL];

        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenter.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // select cuboid
              .click()
              .perform();
          })
          .then(() => sendKeySequences(keySequences))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'DepthChangeKeyboardSubstractFast')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.DepthChangeKeyboardSubstractFast);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.DepthChangeKeyboardSubstractFast.StoreLabeledThingInFrame).toExistInPouchDb();
            done();
          });
      });
    });

    describe('Orientation', () => {
      it('should flip faces clockwise using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('i')
              .perform();
          })
          .then(() => {
            return browser.sleep(500);
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise1);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => {
            return browser.sleep(500);
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise2);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => {
            return browser.sleep(500);
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise3);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('i')
              .perform();
          })
          .then(() => {
            return browser.sleep(500);
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardClockwise4);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
            done();
          });
      });

      it('should flip faces counter clockwise using keyboard shortcuts', done => {
        bootstrapPouch([
          assets.documents.CuboidDrawing.Shared.LabeledThingInFrame.BackCenterRotated.frameIndex0,
        ]);

        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, {x: 563, y: 353}) // initial position
              .click()
              .sendKeys('u')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise1);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise2);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise3')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise3);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
          })
          .then(() => {
            return browser.actions()
              .sendKeys('u')
              .perform();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardCounterClockwise4')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardCounterClockwise4);
            return browser.sleep(1000);
          })
          .then(() => {
            expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardCounterClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
            done();
          });
      });
    });
  });

  describe('Pseudo3d', () => {
    it('should switch to 2d mode and back to 3d if back side is not visible', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .perform();
        })
        .then(() => sendKeySequences(['oo']))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(() => sendKeySequences(['pp']))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if front side is not visible', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dDepth180.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('p')
            .sendKeys('p')
            .sendKeys('p')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dDepth180);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('o')
            .sendKeys('o')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dDepth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dDepth180);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dDepth180.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if left side is not visible', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('p')
            .sendKeys('p')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('o')
            .sendKeys('o')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
          done();
        });
    });

    it('should switch to 2d mode and back to 3d if right side is not visible', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dWidth180.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('p')
            .sendKeys('p')
            .sendKeys('p')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dWidth180);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('o')
            .sendKeys('o')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Real3dWidth180')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Real3dWidth180);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dWidth180.StoreLabeledThingInFrameReal3d).toExistInPouchDb();
          done();
        });
    });

    it('should switch to 2d mode if height is changed to above the visual threshold', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0,
        assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.frameIndex0to4,
      ]);

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
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'Pseudo3dHeightHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.Pseudo3dHeightHandle);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.Pseudo3dHeightHandle.StoreLabeledThingInFramePseudo3d).toExistInPouchDb();
          done();
        });
    });

    it('should flip faces clockwise using keyboard shortcuts', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('i')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise1);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise2);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise3);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('i')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise4);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
          done();
        });
    });

    it('should flip faces counter clockwise using keyboard shortcuts', done => {
      bootstrapPouch([
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0,
        assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.frameIndex0to4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 563, y: 353}) // initial position
            .click()
            .sendKeys('u')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise1);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise2);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame2).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise3);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame3).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys('u')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidDrawing', 'FlipFaceKeyboardPseudo2dCounterClockwise4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise4);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidDrawing.FlipFaceKeyboardPseudo2dCounterClockwise.StoreLabeledThingInFrame4).toExistInPouchDb();
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
  });
});
