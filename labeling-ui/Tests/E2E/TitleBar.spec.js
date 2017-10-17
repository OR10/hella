import {
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

describe('Title Bar', () => {
  let assets;
  let viewer;
  let shapeFrameRange;

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
      assets.mocks.TitleBar.Rectangle.Task,
      assets.mocks.TitleBar.Rectangle.TaskConfiguration,
      assets.mocks.TitleBar.Rectangle.TaskConfigurationFile,
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

    viewer = element(by.css('.layer-container'));
    shapeFrameRange = element(by.css('.shape-frame-range'));
  });

  it('should display the frame index range', done => {
    bootstrapPouch([
      assets.documents.TitleBar.DrawOneRectangle.LabeledThingInFrame.frameIndex0to3,
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
      .then(() => {
        expect(shapeFrameRange.getText()).toBe('1-4');
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 255, y: 255})
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(shapeFrameRange.getText()).toBe('1-1');
      })
      .then(() => done());
  });

  it('should display the frame index range for labeled thing groups', done => {
    bootstrapPouch([
      assets.documents.TitleBar.DrawOneRectangle.LabeledThingInFrame.frameIndex0to3,
    ]);

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 85})
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(shapeFrameRange.getText()).toBe('1-4');
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 250, y: 235})
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(shapeFrameRange.getText()).toBe('1-1');
      })
      .then(() => done());
  });

  afterEach(() => {
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
