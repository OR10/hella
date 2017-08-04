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

  function drawFirstRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 100, y: 100}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 200, y: 200}) // initial position
      .mouseUp()
      .perform();
  }

  function drawSecondRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 250, y: 250}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 350, y: 450}) // initial position
      .mouseUp()
      .perform();
  }

  function drawThirdRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 150, y: 500}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 350, y: 570}) // initial position
      .mouseUp()
      .perform();
  }

  function drawFourthRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 400, y: 400}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 700, y: 500}) // initial position
      .mouseUp()
      .perform();
  }

  it('should draw four and then additionally select the first three rectangles', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(drawFirstRectangle)
      .then(drawSecondRectangle)
      .then(drawThirdRectangle)
      .then(drawFourthRectangle)
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, {x: 100, y: 100})
          .click()
          .mouseMove(viewer, {x: 250, y: 250})
          .click()
          .mouseMove(viewer, {x: 150, y: 500})
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
});