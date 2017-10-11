import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  dumpAllRequestsMade,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';

fdescribe('ShapeMerging', () => {
  let assets;
  let viewer;
  let sharedMocks;
  let shapeInboxButton;
  let headerPlusButton;
  let mergeButton;
  let modalConfirmButton;

  const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

  const firstShape = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondShape = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

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

    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.DrawTwoRectanglesOnOneFrame,
    ]);

    viewer = element(by.css('.layer-container'));
    shapeInboxButton = element(by.css('.task-bar .icon.fa-inbox'));
    headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
    mergeButton = element(by.css('.popup-inbox-actions i.fa-compress'));
    modalConfirmButton = element(by.css('.modal-button-confirm'));
  });

  describe('Modal window', () => {
    describe('merging two shapes on the same frame', () => {
      it('uses the first clicked shape as root', done => {
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
          .then(() => shapeInboxButton.click())
          .then(() => browser.sleep(250))
          .then(() => headerPlusButton.click())
          .then(() => browser.sleep(250))
          .then(() => mergeButton.click())
          .then(() => browser.sleep(250))
          .then(() => modalConfirmButton.click())
          .then(() => browser.sleep(250))
          .then(() => browser.sleep(250))
          .then(() => shapeInboxButton.click())
          // .then(() => dumpAllRequestsMade())
          .then(() => {
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThing).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThingInFrame).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.DeleteLabeledThing).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.DeleteLabeledThingInFrame).not.toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnOneFrame1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnOneFrame1);
          })
          .then(() => done());
      });

      it('uses the second shape', done => {
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
          .then(() => shapeInboxButton.click())
          .then(() => browser.sleep(250))
          .then(() => headerPlusButton.click())
          .then(() => browser.sleep(250))
          .then(() => mergeButton.click())
          .then(() => browser.sleep(250))
          .then(() => element(by.cssContainingText('option', 'rectangle #2')).click())
          .then(() => browser.sleep(250))
          .then(() => modalConfirmButton.click())
          .then(() => browser.sleep(250))
          .then(() => browser.sleep(250))
          .then(() => shapeInboxButton.click())
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnOneFrame2')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnOneFrame2);
          })
          .then(() => done());
      });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
