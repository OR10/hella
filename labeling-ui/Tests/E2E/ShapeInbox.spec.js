import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed, initApplication, bootstrapHttp, bootstrapPouch,
  dumpAllRequestsMade
} from '../Support/Protractor/Helpers'
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('ShapeInbox', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let shapeInboxBadge;

  const firstShape = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondShape = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

  function drawRectangle(rectangle) {
    return browser.actions()
      // .click(toolButton0) // Rect drawing
      .mouseMove(viewer, rectangle.topLeft) // initial position
      .mouseDown()
      .mouseMove(viewer, rectangle.bottomRight) // initial position
      .mouseUp()
      .perform();
  }

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    bootstrapHttp([
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
    ]);

    bootstrapPouch([
      assets.documents.ShapeInbox.DrawTwoRectangles,
    ]);

    viewer = element(by.css('.layer-container'));
    shapeInboxBadge = element(by.css('.task-bar .badge'));
  });

  it('should not show a badge if no shape is selected', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => shapeInboxBadge.getText())
      .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
      .then(() => done());
  });

  it('should show a badge if one shape is selected', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, firstShape.topLeft) // initial position
          .click()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => shapeInboxBadge.getText())
      .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
      .then(() => done());
  });

  it('should show a badge if two shapes are selected', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft) // initial position
          .click()
          .mouseMove(viewer, secondShape.topLeft) // initial position
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => shapeInboxBadge.getText())
      .then(shapeInboxCount => expect(shapeInboxCount).toEqual('2'))
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});