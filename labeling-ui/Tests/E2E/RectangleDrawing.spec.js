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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'LoadAndDrawTwoRectangles')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'SelectOneRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'SelectAndDeselectRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'SelectAnotherRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'MoveOneRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'ResizeOneRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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

  // // Something is wrong here with the mocked request data. The second frame seems to have 2 different shapes at the same position
  // // Therefore the selection rendering is off and can't be properly checked.
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.KeepSelectionOverFrameChange);
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
        // () => canvasInstructionLogManager.getCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getCanvasLogs()
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
