import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Task,
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
  });

  it('should load and draw one rectangle', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawOneRectangle);
      })
      .then(() => done());
  });

  it('should load and draw two rectangles', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawTwoRectangles);
      })
      .then(() => done());
  });

  it('should select a rectangle', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'SelectOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.SelectOneRectangle);
      })
      .then(() => done());
  });

  it('should select and deselect a rectangle', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'SelectAndDeselectRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.SelectAndDeselectRectangle);
      })
      .then(() => done());
  });

  it('should deselect one and select an other rectangle', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'SelectAnotherRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.SelectAnotherRectangle);
      })
      .then(() => done());
  });

  it('should correctly move a rectangle and save the changed coordinates', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 110, y: 130}) // drag
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'MoveOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        // () => browser.pause()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.MoveOneRectangle);
      })
      .then(() => done());
  });

  it('should correctly resize a rectangle and save the changed coordinates', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 200}) // bottom right drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 300}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'ResizeOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.ResizeOneRectangle);
      })
      .then(() => done());
  });

  it('should correctly resize a rectangle while flipping bottomRight and topLeft', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.ResizeFlip.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 600, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 600}) // bottom right drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 100}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.ResizeFlip.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'ResizeFlip')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.ResizeFlip);
      })
      .then(() => done());
  });

  it('should keep the rectangle selected over a frame change', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0and1,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        return nextFrameButton.click();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.KeepSelectionOverFrameChange);
      })
      .then(() => done());
  });

  it('should draw a new rectangle', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 700, y: 500}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangle);
      })
      .then(() => done());
  });

  it('should draw a new rectangle from top-left to bottom-right with minimal height constrains', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 450, y: 350}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleMinimalHeight);
      })
      .then(() => done());
  });

  it('should draw a new rectangle from bottom-right to top-left with minimal height constrains', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 450, y: 400}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 350}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleMinimalHeight);
      })
      .then(() => done());
  });

  it('should draw a new rectangle with intermediary mouse movements', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary1);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 400}) // intermediary position
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary2);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 700, y: 500}) // final position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary3);
      })
      .then(() => done());
  });

  it('should draw multiple new rectangles', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 300}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 500}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 600, y: 400}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 100}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 800, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 200}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame2).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame3).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewMultipleRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewMultipleRectangles);
      })
      .then(() => done());
  });

  it('should draw a new rectangle from top-right to bottom-left', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 500, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleOpposite')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleOpposite);
      })
      .then(() => done());
  });

  it('should draw a new rectangle from bottom-left to top-right', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 100}) // initial position
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleOpposite')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleOpposite);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
