import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  bootstrapHttp,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('GhostDrawing', () => {
  let assets;
  let defaultShapeCreationButton;
  let nextFrameButton;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.GhostDrawing.Video,
      assets.mocks.GhostDrawing.Task,
      assets.mocks.GhostDrawing.TaskConfiguration,
      assets.mocks.GhostDrawing.TaskConfigurationFile,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ]);

    defaultShapeCreationButton = element(by.css('#default-shape-creation-button'));
    nextFrameButton = element(by.css('.next-frame-button'));
    viewer = element(by.css('.layer-container'));
  });

  it('should create a rectangle ghost with dotted lines and dashes on persist', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
         // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedRectangle);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 300})
          .mouseDown()
          .mouseMove(viewer, {x: 550, y: 350})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Rectangle);
      })
      .then(() => done());
  });

  it('should create a pedestrian shape ghost with dotted lines and dashes on persistence', done => {
    const pedestrianToolButton = element(by.css('.tool-1'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => pedestrianToolButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedPedestrian);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 300})
          .mouseDown()
          .mouseMove(viewer, {x: 510, y: 310})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Pedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Pedestrian);
      })
      .then(() => done());
  });

  it('should create a point shape ghost with dotted lines and dashes on persistence', done => {
    const pointToolButton = element(by.css('.tool-2'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => pointToolButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedPoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedPoint);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 512, y: 310})
          .mouseDown()
          .mouseMove(viewer, {x: 550, y: 350})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Point')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Point);
      })
      .then(() => done());
  });

  it('should create a polygon shape ghost with dotted lines and dashes on persistence', done => {
    const polygonToolButton = element(by.css('.tool-3'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => polygonToolButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedPolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedPolygon);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 300})
          .mouseDown()
          .mouseMove(viewer, {x: 550, y: 350})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Polygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Polygon);
      })
      .then(() => done());
  });

  it('should create a polyline shape ghost with dotted lines and dashes on persistence', done => {
    const polylineToolButton = element(by.css('.tool-4'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => polylineToolButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedPolyline);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 300})
          .mouseDown()
          .mouseMove(viewer, {x: 550, y: 350})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Polyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Polyline);
      })
      .then(() => done());
  });

  it('should create a cuboid shape ghost with dotted lines and dashes on persistence', done => {
    const cuboidToolButton = element(by.css('.tool-5'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => cuboidToolButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'GhostedCuboid')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.GhostedCuboid);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 550, y: 400})
          .mouseDown()
          .mouseMove(viewer, {x: 560, y: 410})
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1})
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GhostDrawing', 'Cuboid')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GhostDrawing.Cuboid);
      })
      .then(() => done());
  });
});
