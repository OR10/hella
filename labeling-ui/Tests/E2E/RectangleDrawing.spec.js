import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
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
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawOneRectangle);
        done();
      });
  });

  it('should load and draw two rectangles', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawTwoRectangles);
        done();
      });
  });

  it('should select a rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

  it('should select and deselect a rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

  it('should deselect one and select an other rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

  it('should correctly move a rectangle and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
        // () => browser.pause()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.MoveOneRectangle);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleDrawing.MoveOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a rectangle and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleDrawing.ResizeOneRectangle.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a rectangle while flipping bottomRight and topLeft', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.ResizeFlip.frameIndex0,
      assets.mocks.RectangleDrawing.ResizeFlip.frameIndex0to4,
      assets.mocks.RectangleDrawing.ResizeFlip.StoreLabeledThingInFrame,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 600}) // bottom right drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 100}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'ResizeFlip')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.ResizeFlip);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleDrawing.ResizeFlip.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should keep the rectangle selected over a frame change', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex1,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.frameIndex1to5,
      assets.mocks.RectangleDrawing.OneRectangleTwoFrames.LabeledThingInFrame.getLabeledThingInFrame0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 110, y: 110}) // initial position
        .click()
        .perform()
      )
      .then(() => browser.sleep(500))
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        return nextFrameButton.click();
      })
      .then(() => browser.sleep(1000))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.KeepSelectionOverFrameChange);
        done();
      });
  });

  it('should draw a new rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame1,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new rectangle from top-left to bottom-right with minimal height constrains', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.Task,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 300, y: 300}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 450, y: 350}) // initial position
        .mouseUp()
        .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleMinimalHeight);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new rectangle from bottom-right to top-left with minimal height constrains', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.Task,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing,
      assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 450, y: 400}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 300, y: 350}) // initial position
        .mouseUp()
        .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleMinimalHeight);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleMinimalHeight.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new rectangle with intermediary mouse movements', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThingInFrame,
      assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThing,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 300, y: 300}) // initial position
        .mouseDown()
        .perform()
      )
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary1);
      })
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 500, y: 400}) // intermediary position
        .perform()
      )
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary2);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 700, y: 500}) // final position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleIntermediary3);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleIntermediary.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should draw multiple new rectangles', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame2,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame3,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame4,
      assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangle.StoreLabeledThingInFrame4);
        done();
      });
  });

  it('should draw a new rectangle from top-right to bottom-left', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing,
      assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 500, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleOpposite')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleOpposite);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame);
        done();
      });
  });

  it('should draw a new rectangle from bottom-left to top-right', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.RectangleDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing,
      assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame,
    ]));
    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 100}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'NewRectangleOpposite')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.NewRectangleOpposite);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.RectangleDrawing.NewRectangleOpposite.StoreLabeledThingInFrame);
        done();
      });
  });

  // Needs to be fixed in code
  xit('should correctly handle extra information in limited labeledThingInFrame request', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.IgnoreLimit.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.IgnoreLimit.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleDrawing', 'LoadAndDrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleDrawing.LoadAndDrawOneRectangle);
        done();
      });
  });


  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
