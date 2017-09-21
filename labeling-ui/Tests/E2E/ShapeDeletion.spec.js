import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication, bootstrapHttp, bootstrapPouch} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Shape deletion (TTANNO-1474)', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let deleteShapeButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
    deleteShapeButton = element(by.css('#delete-shape-button'));
  });

  it('should delete a Rectangle', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Rectangle.Task,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Rectangle.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'RectangleBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.RectangleBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'RectangleAfter')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  it('should delete a Pedestrian', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Pedestrian.Task,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Pedestrian.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'PedestrianBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.PedestrianBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'Empty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  it('should delete a Polygon', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Polygon.Task,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Polygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'PolygonBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.PolygonBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'Empty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  it('should delete a Polyline', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Polyline.Task,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Polyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'PolylineBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.PolylineBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'Empty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  it('should delete a Point', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Point.Task,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Point.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'PointBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.PointBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 100})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'Empty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  it('should delete a Cuboid', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Cuboid.Task,
      assets.mocks.ShapeDeletion.Cuboid.Video,
    ]));

    bootstrapPouch([
      assets.documents.ShapeDeletion.Cuboid.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'CuboidBefore')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.CuboidBefore);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 560, y: 360})
          .click()
          .perform();
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeDeletion', 'Empty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeDeletion.Empty);
      })
      .then(() => {
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.ShapeDeletion.Shared.DeleteLabeledThing).not.toExistInPouchDb();
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
