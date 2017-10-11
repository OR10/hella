import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  expectAllModalsToBeClosed,
  expectModalToBePresent,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cut shapes', () => {
  let assets;
  let viewer;
  let cutShapeButton;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.CutShape.Rectangle.Task,
      assets.mocks.CutShape.Rectangle.TaskConfiguration,
      assets.mocks.CutShape.Rectangle.TaskConfigurationFile,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ]);

    cutShapeButton = element(by.css('#cut-shape-button'));

    viewer = element(by.css('.layer-container'));
  });

  it('should cut a shape', done => {
    bootstrapPouch([
      assets.documents.CutShapes.DrawOneRectangle.LabeledThingInFrame.frameIndex0_3,
    ]);

    const nextFrameButton = element(by.css('.next-frame-button'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 260, y: 260})
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => cutShapeButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 400, y: 400})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CutShapes', 'DrawOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CutShapes.DrawOneRectangle);
      })
      .then(() => {
        expectAllModalsToBeClosed();
        done();
      });
  });

  it('should not cut a shape on the first LT frame range', done => {
    bootstrapPouch([
      assets.documents.CutShapes.DrawOneRectangle.LabeledThingInFrame.frameIndex0_3,
    ]);

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110})
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => cutShapeButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });

  it('should not cut a shape outside LT frame range', done => {
    bootstrapPouch([
      assets.documents.CutShapes.DrawOneRectangle.LabeledThingInFrame.frameIndex0_3,
    ]);

    const nextFrameButton = element(by.css('.next-frame-button'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110})
          .click()
          .perform();
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => cutShapeButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });

  it('should not cut a shape if no more shapes remaining on the left side', done => {
    bootstrapPouch([
      assets.documents.CutShapes.DrawOneRectangle.LabeledThingInFrame.frameIndex1,
    ]);

    const nextFrameButton = element(by.css('.next-frame-button'));
    const previousFrameButton = element(by.css('.previous-frame-button'));
    const openBracketButton = element(by.css('.open-bracket-button'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 160, y: 160})
          .click()
          .perform();
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(() => openBracketButton.click())
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => cutShapeButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });

  it('should not cut a shape if no more shapes remaining on the right side', done => {
    bootstrapPouch([
      assets.documents.CutShapes.DrawOneRectangle.LabeledThingInFrame.frameIndex1,
    ]);

    const nextFrameButton = element(by.css('.next-frame-button'));
    const closeBracketButton = element(by.css('.close-bracket-button'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 160, y: 160})
          .click()
          .perform();
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => closeBracketButton.click())
      .then(() => mediumSleep())
      .then(() => cutShapeButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });

  afterEach(() => {
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
