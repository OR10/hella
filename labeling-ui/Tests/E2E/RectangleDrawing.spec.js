import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
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
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawOneRectangle);
        done();
      });
  });

  it('should load and draw two rectangles', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawTwoRectangles);
        done();
      });
  });

  it('should select a rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
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
        done();
      });
  });

  it('should select and deselect a rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
        browser.actions()
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
        done();
      });
  });

  it('should deselect one and select an other rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();
        browser.actions()
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
        done();
      });
  });

  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 110, y: 130}) // drag
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'MoveOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.MoveOneRectangle);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.RectangleDrawing.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  // We are currently missing one horizontal pixel here
  // Might be a sizing bug…
  it('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 200}) // bottom right drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 300}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'ResizeOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.ResizeOneRectangle);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  it('should keep the labeled thing selected over a frame change', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex1,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));

        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .click()
          .perform();

        nextFrameButton.click();

        browser.sleep(1000);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.KeepSelectionOverFrameChange);
        done();
      });
  });

  it('should draw a new rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame1,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing,
    ]));
    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 700, y: 500}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangle);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing.request);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame1.request);
        done();
      });
  });

  it('should draw multiple new rectangles', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame2,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame3,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing,
    ]));
    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
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
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewMultipleRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewMultipleRectangles);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing.request);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame2.request);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame3.request);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame4.request);
        done();
      });
  });

  // Needs to be fixed in code
  xit('should correctly handle extra information in limited labeledThingInFrame request', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.IgnoreLimit.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.IgnoreLimit.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawOneRectangle);
        done();
      });
  });


  afterEach(() => {
    mock.teardown();
  });
});
