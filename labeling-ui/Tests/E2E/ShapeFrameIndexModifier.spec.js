import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, expectModalToBePresent, initApplication, bootstrapHttp} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('change frame index for shapes', () => {
  let assets;
  let sharedMocks;
  let defaultShapeCreationButton;
  let jumpToPreviousFrameButton;
  let jumpToNextFrameButton;
  let setOpenBracketButton;
  let setCloseBracketButton;
  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.DefaultShapeCreation.Shared.Video,
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
      assets.mocks.DefaultShapeCreation.Shared.StoreLabeledThing,
    ];

    defaultShapeCreationButton = element(by.css('#default-shape-creation-button'));
    jumpToPreviousFrameButton = element(by.css('#jump-to-previous-frame-button'));
    jumpToNextFrameButton = element(by.css('#jump-to-next-frame-button'));
    setOpenBracketButton = element(by.css('#set-open-bracket-button'));
    setCloseBracketButton = element(by.css('#set-close-bracket-button'));
  });

  it('should expand frame index ahead', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => browser.sleep(300))
      .then(() => jumpToNextFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => setCloseBracketButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => browser.sleep(300))
      .then(() => {
        expectAllModalsToBeClosed();
        done();
      });
  });

  it('should expand frame index backwards', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => jumpToNextFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => defaultShapeCreationButton.click())
      .then(() => browser.sleep(300))
      .then(() => jumpToPreviousFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => setOpenBracketButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => browser.sleep(300))
      .then(() => {
        expectAllModalsToBeClosed();
        done();
      });
  });

  it('should not expand frame index ahead if no more ltifs left', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => browser.sleep(300))
      .then(() => jumpToNextFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => setCloseBracketButton.click())
      .then(() => browser.sleep(300))
      .then(() => setOpenBracketButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => browser.sleep(300))
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });

  it('should not expand frame index backwards if no more ltifs left', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => jumpToNextFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => defaultShapeCreationButton.click())
      .then(() => browser.sleep(300))
      .then(() => jumpToPreviousFrameButton.click())
      .then(() => browser.sleep(300))
      .then(() => setOpenBracketButton.click())
      .then(() => browser.sleep(300))
      .then(() => setCloseBracketButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => browser.sleep(300))
      .then(() => {
        expectModalToBePresent();
        done();
      });
  });
});
