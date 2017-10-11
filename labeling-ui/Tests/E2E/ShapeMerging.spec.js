import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
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
  let nextFrameButton;
  let previousFrameButton;

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

    viewer = element(by.css('.layer-container'));
    shapeInboxButton = element(by.css('.task-bar .icon.fa-inbox'));
    headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
    mergeButton = element(by.css('.popup-inbox-actions i.fa-compress'));
    modalConfirmButton = element(by.css('.modal-button-confirm'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
  });

  describe('Modal window', () => {
    describe('merging two shapes on the same frame', () => {
      beforeEach(() => {
        bootstrapPouch([
          assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.DrawTwoRectanglesOnOneFrame,
        ]);
      });

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
          .then(() => {
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThing1).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThingInFrame1).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThing2).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThingInFrame2).not.toExistInPouchDb();
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
          .then(() => {
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThing1).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThingInFrame1).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThing2).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnOneFrame.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
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

    describe('merging two shapes on two frames', () => {
      beforeEach(() => {
        bootstrapPouch([
          assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.DrawTwoRectanglesOnTwoFrames,
        ]);
      });

      it('uses the first clicked shape as root', done => {
        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, secondShape.topLeft) // initial position
              .click()
              .perform();
          })
          .then(() => browser.sleep(250))
          .then(() => shapeInboxButton.click())
          .then(() => browser.sleep(250))
          .then(() => headerPlusButton.click())
          .then(() => browser.sleep(250))
          .then(() => nextFrameButton.click())
          .then(() => browser.sleep(250))
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, firstShape.topLeft) // initial position
              .click()
              .perform();
          })
          .then(() => browser.sleep(250))
          .then(() => headerPlusButton.click())
          .then(() => browser.sleep(250))
          .then(() => mergeButton.click())
          .then(() => browser.sleep(250))
          .then(() => modalConfirmButton.click())
          .then(() => browser.sleep(250))
          .then(() => browser.sleep(250))
          .then(() => shapeInboxButton.click())
          .then(() => {
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.DeleteLabeledThing1).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThingInFrame1).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThing2).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThingInFrame2).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnTwoFrames1Frame1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnTwoFrames1Frame1);
          })
          .then(() => previousFrameButton.click())
          .then(() => browser.sleep(250))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnTwoFrames1Frame0')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnTwoFrames1Frame0);
          })
          .then(() => done());
      });

      it('uses the second shape', done => {
        initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, secondShape.topLeft) // initial position
              .click()
              .perform();
          })
          .then(() => browser.sleep(250))
          .then(() => shapeInboxButton.click())
          .then(() => browser.sleep(250))
          .then(() => headerPlusButton.click())
          .then(() => browser.sleep(250))
          .then(() => nextFrameButton.click())
          .then(() => browser.sleep(250))
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, firstShape.topLeft) // initial position
              .click()
              .perform();
          })
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

          .then(() => {
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThing1).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThingInFrame1).toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.DeleteLabeledThing2).not.toExistInPouchDb();
            expect(assets.documents.ShapeMerging.DrawTwoRectanglesOnTwoFrames.StoreLabeledThingInFrame3).toExistInPouchDb();
          })
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnTwoFrames2Frame1')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnTwoFrames2Frame1);
          })
          .then(() => previousFrameButton.click())
          .then(() => browser.sleep(250))
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeTwoShapesOnTwoFrames2Frame0')
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeTwoShapesOnTwoFrames2Frame0);
          })
          .then(() => done());
      });
    });
  });

  describe('merging two shapes on three frames', () => {
    beforeEach(() => {
      bootstrapPouch([
        assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.DrawFourRectanglesOnThreeFrames,
      ]);
    });

    it('moves all shapes into one labeled thing', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => headerPlusButton.click())
        .then(() => browser.sleep(250))
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(250))
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => headerPlusButton.click())
        .then(() => browser.sleep(250))
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(250))
        .then(() => mergeButton.click())
        .then(() => browser.sleep(250))
        .then(() => element(by.cssContainingText('option', 'rectangle #2')).click())
        .then(() => browser.sleep(250))
        .then(() => modalConfirmButton.click())
        .then(() => browser.sleep(250))
        .then(() => browser.sleep(250))
        .then(() => shapeInboxButton.click())
        .then(() => {
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.StoreLabeledThing).toExistInPouchDb();
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.StoreLabeledThingInFrame1).toExistInPouchDb();
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.StoreLabeledThingInFrame2).toExistInPouchDb();
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.StoreLabeledThingInFrame3).toExistInPouchDb();
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.DeleteLabeledThingInFrame).not.toExistInPouchDb();
          expect(assets.documents.ShapeMerging.DrawFourRectanglesOnThreeFrames.DeleteLabeledThing).not.toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeFourShapesOnThreeFramesFrame2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeFourShapesOnThreeFramesFrame2);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(250))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeFourShapesOnThreeFramesFrame1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeFourShapesOnThreeFramesFrame1);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(250))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeMerging', 'MergeFourShapesOnThreeFramesFrame0')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeMerging.MergeFourShapesOnThreeFramesFrame0);
        })
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
