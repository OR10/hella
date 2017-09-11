import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Shape deletion (TTANNO-1474)', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let deleteShapeButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Rectangle.Task,
      assets.mocks.ShapeDeletion.Rectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Rectangle.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Pedestrian.Task,
      assets.mocks.ShapeDeletion.Pedestrian.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Pedestrian.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Polygon.Task,
      assets.mocks.ShapeDeletion.Polygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Polygon.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Polyline.Task,
      assets.mocks.ShapeDeletion.Polyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Polyline.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Point.Task,
      assets.mocks.ShapeDeletion.Point.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Point.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.ShapeDeletion.Cuboid.Task,
      assets.mocks.ShapeDeletion.Cuboid.Video,
      assets.mocks.ShapeDeletion.Cuboid.LabeledThingInFrame.frameIndex0,
      assets.mocks.ShapeDeletion.Cuboid.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock.teardown();
  });
});
