import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  expectAllModalsToBeClosed,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Point drawing', () => {
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
      assets.mocks.Shared.Video,
      assets.mocks.PointDrawing.Shared.Task,
      assets.mocks.PointDrawing.Shared.TaskConfiguration,
      assets.mocks.PointDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.pointLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.pointLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one point shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawOnePoint.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'LoadAndDrawOnePoint'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.LoadAndDrawOnePoint);
      })
      .then(() => done());
  });

  it('should load and draw two point shapes', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'LoadAndDrawTwoPoints')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.LoadAndDrawTwoPoints);
      })
      .then(() => done());
  });

  it('should select a point shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // initial position
          .click()
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectOnePoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectOnePoint);
      })
      .then(() => done());
  });

  it('should select and deselect a point shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // initial position
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectAndDeselectPoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectAndDeselectPoint);
      })
      .then(() => done());
  });

  it('should select one and then select an other point shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // initial position
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectAnotherPoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectAnotherPoint);
      })
      .then(() => done());
  });

  it('should correctly move a point shape and save the changed coordinates', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 250, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PointDrawing.MoveOnePoint.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'MoveOnePoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.MoveOnePoint);
      })
      .then(() => done());
  });

  it('should keep the point shape selected over a frame change', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PointDrawing.OnePointTwoFrames.LabeledThingInFrame.frameIndex0and1,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // initial position
          .click()
          .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        return nextFrameButton.click();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.KeepSelectionOverFrameChange);
      })
      .then(() => done());
  });

  it('should draw a new point shape', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'NewPoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.NewPoint);
      })
      .then(() => done());
  });

  it('should draw multiple new point shapes', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 900, y: 400}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 450}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 900, y: 200}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 50}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThingInFrame2).toExistInPouchDb();
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThingInFrame3).toExistInPouchDb();
        expect(assets.mocks.PointDrawing.NewPoint.StoreLabeledThingInFrame4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'NewMultiplePoints')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.NewMultiplePoints);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
