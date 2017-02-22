import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Keyboard Shape Movement', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Task,
      assets.mocks.KeyboardShapeMovement.Shared.Video,
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

  describe('Rectangle', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Rectangle.frameIndex0,
        assets.mocks.KeyboardShapeMovement.Rectangle.frameIndex0to4,
        assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
        assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameUp,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameRight,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameDown,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 150, y: 150}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_DOWN)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_LEFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameLeft);
          done();
        });
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftUp,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftRight,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftDown,
        assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 150, y: 150}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftLeft);
          done();
        });
    });
  });

  describe('Pedestrian', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Pedestrian.frameIndex0,
        assets.mocks.KeyboardShapeMovement.Pedestrian.frameIndex0to4,
        assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to3,
        assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to4,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameUp,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameRight,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameDown,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 190, y: 250}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_DOWN)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_LEFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameLeft);
          done();
        });
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftUp,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftRight,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftDown,
        assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 190, y: 250}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftLeft);
          done();
        });
    });
  });

  describe('Cuboid', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Cuboid.frameIndex0,
        assets.mocks.KeyboardShapeMovement.Cuboid.frameIndex0to4,
        assets.mocks.Shared.Thumbnails.cuboidLabeledThingsInFrame0to4,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameUp,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameRight,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameDown,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 521, y: 336}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_DOWN)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.ARROW_LEFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameLeft);
          done();
        });
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      mock(sharedMocks.concat([
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftUp,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftRight,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftDown,
        assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftLeft,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 521, y: 336}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftUp);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftUp);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftRight);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftRight);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftDown);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftDown);
        })
        .then(() => {
          browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftLeft);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainRequest(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftLeft);
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
