import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  expectAllModalsToBeClosed,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polyline drawing', () => {
  let assets;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PolylineDrawing.Shared.Task,
      assets.mocks.PolylineDrawing.Shared.TaskConfiguration,
      assets.mocks.PolylineDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ]);

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one polyline shape', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'LoadAndDrawOnePolyline'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.LoadAndDrawOnePolyline);
      })
      .then(() => done());
  });

  it('should load and draw two polyline shapes', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'LoadAndDrawTwoPolylines')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.LoadAndDrawTwoPolylines);
      })
      .then(() => done());
  });

  it('should select a polyline shape', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectOnePolyline);
      })
      .then(() => done());
  });

  it('should select and deselect a polyline shape', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
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
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectAndDeselectPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectAndDeselectPolyline);
      })
      .then(() => done());
  });

  it('should select one and then select an other polyline shape', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectAnotherPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectAnotherPolyline);
      })
      .then(() => done());
  });

  it('should correctly move a polyline shape and save the changed coordinates', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 250, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.MoveOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'MoveOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.MoveOnePolyline);
      })
      .then(() => done());
  });

  it('should correctly resize a polyline shape and save the changed coordinates', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 300}) // bottom drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 200, y: 400}) // drag
          .mouseUp()
          .mouseMove(viewer, {x: 100, y: 200}) // left drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 200}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'ResizeOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.ResizeOnePolyline);
      })
      .then(() => done());
  });

  it('should snap to nearest start end point of other polyline', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 100}) // top drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 591, y: 99}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1Snap).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SnapPoint')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SnapPoint);
      })
      .then(() => done());
  });

  it('should keep the polyline shape selected over a frame change', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.OnePolylineTwoFrames.LabeledThingInFrame.frameIndex0and1,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
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
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.KeepSelectionOverFrameChange);
      })
      .then(() => done());
  });

  it('should draw a new polyline shape', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 600, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolyline);
      })
      .then(() => done());
  });

  it('should draw a new Polyline shape with intermediary mouse movements', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary1);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 600, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary2);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary3);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary4);
      })
      .then(() => done());
  });

  it('should draw multiple new Polyline shapes', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 150, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline1);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 350, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline2);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 650, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame2).toExistInPouchDb();
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame3).toExistInPouchDb();
        expect(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline3);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
