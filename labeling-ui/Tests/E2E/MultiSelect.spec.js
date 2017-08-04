import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('MultiSelect', () => {
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

    mock(sharedMocks);

    viewer = element(by.css('.layer-container'));
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });

  const firstRectangle = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondRectangle = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

  const thirdRectangle = {
    topLeft: {x: 150, y: 500},
    bottomRight: {x: 350, y: 570},
  };

  const fourthRectangle = {
    topLeft: {x: 400, y: 400},
    bottomRight: {x: 700, y: 500},
  };

  function drawRectangle(rectangle) {
    return browser.actions()
      .mouseMove(viewer, rectangle.topLeft) // initial position
      .mouseDown()
      .mouseMove(viewer, rectangle.bottomRight) // initial position
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
      .then(() => drawRectangle(firstRectangle))
      .then(() => drawRectangle(secondRectangle))
      .then(() => drawRectangle(thirdRectangle))
      .then(() => drawRectangle(fourthRectangle))
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstRectangle.topLeft)
          .click()
          .mouseMove(viewer, secondRectangle.topLeft)
          .click()
          .mouseMove(viewer, thirdRectangle.topLeft)
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

  it('should draw four, deselet and then select two of the rectangles with ctrl+click', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => drawRectangle(firstRectangle))
      .then(() => drawRectangle(secondRectangle))
      .then(() => drawRectangle(thirdRectangle))
      .then(() => drawRectangle(fourthRectangle))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, thirdRectangle.topLeft)
          .click()
          .mouseMove(viewer, secondRectangle.topLeft)
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
      .then(() => drawRectangle(firstRectangle))
      .then(() => drawRectangle(secondRectangle))
      .then(() => drawRectangle(thirdRectangle))
      .then(() => drawRectangle(fourthRectangle))
      .then(deselectAfterDrawing)
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, thirdRectangle.topLeft)
          .click()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, secondRectangle.topLeft)
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
});