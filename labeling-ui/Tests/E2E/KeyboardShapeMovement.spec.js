import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Keyboard Shape Movement', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
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
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
        assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      ]));

      bootstrapPouch([
        assets.documents.KeyboardShapeMovement.Rectangle.frameIndex0,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 150}) // select shape
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => sendKeys(protractor.Key.ARROW_UP))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameUp).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleUp);
        })
        .then(() => sendKeys(protractor.Key.ARROW_RIGHT))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameRight).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleRight);
        })
        .then(() => sendKeys(protractor.Key.ARROW_DOWN))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameDown).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleDown);
        })
        .then(() => sendKeys(protractor.Key.ARROW_LEFT))
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleLeft);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameLeft).toExistInPouchDb();
        })
        .then(() => done());
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 150, y: 150}) // select shape
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftUp).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftUp);
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftRight).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftRight);
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.NULL]))
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftDown);
        })
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftDown).toExistInPouchDb();
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Rectangle.StoreLabeledThingInFrameShiftLeft).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'RectangleShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.RectangleShiftLeft);
        })
        .then(() => done());
    });
  });

  describe('Pedestrian', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to3,
        assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to4,
      ]));

      bootstrapPouch([
        assets.documents.KeyboardShapeMovement.Pedestrian.frameIndex0,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 190, y: 250}) // select shape
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => sendKeys(protractor.Key.ARROW_UP))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameUp).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianUp);
        })
        .then(() => sendKeys(protractor.Key.ARROW_RIGHT))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameRight).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianRight);
        })
        .then(() => sendKeys(protractor.Key.ARROW_DOWN))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameDown).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianDown);
        })
        .then(() => sendKeys(protractor.Key.ARROW_LEFT))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameLeft).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianLeft);
        })
        .then(() => done());
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 190, y: 250}) // select shape
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftUp).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftUp);
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftRight).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftRight);
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftDown).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftDown);
        })
        .then(() => sendKeys([protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.NULL]))
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Pedestrian.StoreLabeledThingInFrameShiftLeft).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'PedestrianShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.PedestrianShiftLeft);
        })
        .then(() => done());
    });
  });

  describe('Cuboid', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.Shared.Thumbnails.cuboidLabeledThingsInFrame0to4,
      ]));

      bootstrapPouch([
        assets.documents.KeyboardShapeMovement.Cuboid.frameIndex0,
      ]);
    });

    it('should move shape by a small distance using arrow keys', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 521, y: 336}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          return browser.sleep(500);
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_UP)
            .perform();
        })
        .then(() => {
          return browser.sleep(500);
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidUp);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameUp).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_RIGHT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidRight);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameRight).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_DOWN)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidDown);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameDown).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.ARROW_LEFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidLeft);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameLeft).toExistInPouchDb();
          done();
        });
    });

    it('should move shape by a greater distance using arrow keys + shift', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 521, y: 336}) // select shape
            .click()
            .perform();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftUp')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftUp);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftUp).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_RIGHT, protractor.Key.NULL)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftRight')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftRight);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftRight).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_DOWN, protractor.Key.NULL)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftDown')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftDown);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftDown).toExistInPouchDb();
        })
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_LEFT, protractor.Key.NULL)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('KeyboardShapeMovement', 'CuboidShiftLeft')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeyboardShapeMovement.CuboidShiftLeft);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.KeyboardShapeMovement.Cuboid.StoreLabeledThingInFrameShiftLeft).toExistInPouchDb();
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
