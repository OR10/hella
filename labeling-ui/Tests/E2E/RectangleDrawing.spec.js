import mock from 'protractor-http-mock';
import ViewerDataManager from '../Support/ViewerDataManager';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import CoordinatesTransformer from '../Support/CoordinatesTransformer';
import {getMockRequestsMade} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {
  let assets;
  let sharedMocks;
  let coords;


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

    coords = new CoordinatesTransformer({
      width: 1024,
      height: 620,
    });
  });

  it('should load and draw one rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.LoadAndDrawOneRectangle);
      done();
    });
  });

  it('should load and draw two rectangles', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.LoadAndDrawTwoRectangles);
      done();
    });
  });

  it('should select a rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    browser.get('/labeling/task/TASKID-TASKID');

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
          .click()
          .perform();
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.SelectOneRectangle);
        done();
      });
  });

  it('should select and deselect a rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, coords.toViewer(1, 1))
          .click()
          .perform();
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.SelectAndDeselectRectangle);
        done();
      });
  });

  it('should deselect one and select an other rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, coords.toViewer(300, 150)) // initial position
          .click()
          .perform();
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.SelectAnOtherRectangle);
        done();
      });
  });

  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
          .mouseDown()
          .mouseMove(viewer, coords.toViewer(110, 130)) // drag
          .mouseUp()
          .mouseMove(viewer, coords.toViewer(1, 1)) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MoveOneRectangle);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  // We are currently missing one horizontal pixel here
  // Might be a sizing bug…
  xit('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.ResizeOneRectangle.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    browser.sleep(1000);

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(200, 200)) // bottom right drag handle
          .mouseDown()
          .mouseMove(viewer, coords.toViewer(300, 300)) // drag
          .mouseUp()
          .perform();
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ResizeOneRectangle);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  // // Something is wrong here with the mocked request data. The second frame seems to have 2 different shapes at the same position
  // // Therefore the selection rendering is off and can't be properly checked.
  it('should keep the labeled thing selected over a frame change', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex1,
      assets.mocks.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.OneRectangleTwoFrames.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    browser.get('/labeling/task/TASKID-TASKID');

    const nextFrameButton = element(by.css('.next-frame-button'));

    coords.autoSetViewerDimensions()
      .then(({viewer, viewerDimensions}) => {
        browser.actions()
          .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
          .click()
          .perform();

        nextFrameButton.click();

        browser.sleep(1000);
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.KeepSelectionOverFrameChange);
        done();
      });
  });

  // // Needs to be fixed
  xit('should correctly handle extra information in limited labeledThingInFrame request', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.IgnoreLimit.LabeledThingInFrame.frameIndex0,
      assets.mocks.IgnoreLimit.LabeledThingInFrame.frameIndex0to4,
    ]));

    browser.get('/labeling/task/TASKID-TASKID');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.LoadAndDrawOneRectangle);
      done();
    });
  });


  afterEach(() => {
    mock.teardown();
  });
});
