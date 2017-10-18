import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  expectModalToBePresent,
  initApplication,
  bootstrapHttp,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('FrameIndex Change', () => {
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
    jumpToPreviousFrameButton = element(by.css('.previous-frame-button'));
    jumpToNextFrameButton = element(by.css('.next-frame-button'));
    setOpenBracketButton = element(by.css('.open-bracket-button'));
    setCloseBracketButton = element(by.css('.close-bracket-button'));
  });

  it('should expand frame index ahead', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => jumpToNextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => setCloseBracketButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expectAllModalsToBeClosed();
      })
      .then(() => done());
  });

  it('should expand frame index backwards', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => jumpToNextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => jumpToPreviousFrameButton.click())
      .then(() => mediumSleep())
      .then(() => setOpenBracketButton.click())
      .then(() => {
        expectAllModalsToBeClosed();
      })
      .then(() => done());
  });

  it('should not expand frame index ahead if no more ltifs left', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => jumpToNextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => setCloseBracketButton.click())
      .then(() => mediumSleep())
      .then(() => setOpenBracketButton.click())
      .then(() => {
        expectModalToBePresent();
      })
      .then(() => done());
  });

  it('should not expand frame index backwards if no more ltifs left', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => jumpToNextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => jumpToPreviousFrameButton.click())
      .then(() => mediumSleep())
      .then(() => setOpenBracketButton.click())
      .then(() => mediumSleep())
      .then(() => setCloseBracketButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expectModalToBePresent();
      })
      .then(() => done());
  });
});
