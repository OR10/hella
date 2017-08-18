import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('MultiSelect', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.MultipleThings.Shared.Task,
      assets.mocks.MultipleThings.Shared.Video,
      assets.mocks.MultipleThings.Shared.TaskConfiguration,
      assets.mocks.MultipleThings.Shared.TaskConfigurationFile,
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

    mock(sharedMocks);

    viewer = element(by.css('.layer-container'));
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });

  const firstShape = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondShape = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

  const thirdShape = {
    topLeft: {x: 150, y: 500},
    bottomRight: {x: 350, y: 570},
  };

  const fourthShape = {
    topLeft: {x: 400, y: 400},
    bottomRight: {x: 700, y: 500},
  };

  const toolButton0 = element(by.css('button.tool-button.tool-thing.tool-0'));
  const toolButton1 = element(by.css('button.tool-button.tool-thing.tool-1'));

  function drawRectangle(rectangle) {
    return browser.actions()
      .click(toolButton0) // Rect drawing
      .mouseMove(viewer, rectangle.topLeft) // initial position
      .mouseDown()
      .mouseMove(viewer, rectangle.bottomRight) // initial position
      .mouseUp()
      .perform();
  }

  function drawPedestrian(pedestrian) {
    return browser.actions()
      .click(toolButton1) // Rect drawing
      .mouseMove(viewer, pedestrian.topLeft) // initial position
      .mouseDown()
      .mouseMove(viewer, pedestrian.bottomRight) // initial position
      .mouseUp()
      .perform();
  }

  function deselectAfterDrawing() {
    return browser.actions()
      .mouseMove(viewer, {x: 1, y: 1})
      .click()
      .perform();
  }

  it('should draw four and then additionally select the first three rectangles', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawRectangle(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'FourSelectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.FourSelectedShapes);
      })
      .then(() => {
        done();
      });
  });

  it('should draw four, deselect and then select two of the rectangles with ctrl+click', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawRectangle(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'TwoSelectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.TwoSelectedShapes);
      })
      .then(() => {
        done();
      });
  });

  it('should draw four, deselect and then select one with normal click and a second rectangle with ctrl+click', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawRectangle(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'TwoSelectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.TwoSelectedShapes);
      })
      .then(() => {
        done();
      });
  });

  it('should should select and deselect with ctrl+click', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawRectangle(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'ThreeSelectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.ThreeSelectedShapes);
      })
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'TwoSelectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.TwoSelectedShapes);
      })
      .then(() => {
        done();
      });
  });

  it('should should select and deselect with ctrl+click (TTANNO-1813)', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => drawRectangle(firstShape))
        .then(() => drawRectangle(secondShape))
        .then(() => drawRectangle(thirdShape))
        .then(deselectAfterDrawing)
        .then(() => {
          return browser.actions()
              .sendKeys(protractor.Key.CONTROL)
              .mouseMove(viewer, thirdShape.topLeft)
              .click()
              .sendKeys(protractor.Key.CONTROL)
              .mouseMove(viewer, firstShape.topLeft)
              .click()
              .mouseMove(viewer, secondShape.topLeft)
              .click()
              .sendKeys(protractor.Key.NULL)
              .mouseMove(viewer, {x: 1, y: 1})
              .click()
              .perform();
        })
        .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'DeselectShapesWithCTRLCLICK')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.DeselectShapesWithCTRLCLICK);
        })
        .then(() => {
          done();
        });
  });

  it('should remove the label selector once more than one rectangle is selected', done => {
    const labelSelector = element(by.css('label-selector'));
    const labelSelectorHelper = new LabelSelectorHelper(labelSelector);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawRectangle(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .perform();
      })
      .then(() => expect(labelSelectorHelper.getNumberOfVisiblePanes()).toBe(1))
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(() => browser.sleep(1000))
      .then(() => expect(labelSelectorHelper.getNumberOfVisiblePanes()).toBe(0))
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => expect(labelSelectorHelper.getNumberOfVisiblePanes()).toBe(1))
      .then(() => {
        done();
      });
  });

  it('should only select shapes of the same type', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawPedestrian(firstShape))
      .then(() => drawRectangle(secondShape))
      .then(() => drawPedestrian(thirdShape))
      .then(() => drawRectangle(fourthShape))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .mouseMove(viewer, thirdShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultiSelect', 'TwoSelectedPedestrians')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultiSelect.TwoSelectedPedestrians);
      })
      .then(() => {
        done();
      });
  });
});
