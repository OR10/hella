import {
    expectModalToBePresent,
    initApplication,
    mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

describe('Cuboid exception', () => {
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
      assets.mocks.CuboidCreation.Shared.Task,
      assets.mocks.CuboidCreation.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.CuboidCreation.Shared.FrameLocations.source.frameIndex0,
      assets.mocks.CuboidCreation.Shared.FrameLocations.source.frameIndex0to1,
      assets.mocks.CuboidCreation.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.CuboidCreation.Shared.FrameLocations.Thumbnail.frameIndex0to1,
      assets.mocks.Shared.Thumbnails.cuboidLabeledThingsInFrame0to1,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  describe('horizon', () => {
    it('should display a modal if drawn above the horizon', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
        assets.mocks.CuboidCreation.Shared.StoreLabeledThing,
        assets.mocks.CuboidCreation.MinimalBottomToTop.StoreLabeledThingInFrame,
      ]));
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
       .then(() => {
         return browser.actions()
               .mouseMove(viewer, {x: 105, y: 172}) // initial position
               .mouseDown()
               .mouseMove(viewer, {x: 105, y: 10}) // drag
               .mouseUp()
               .perform();
       })
       .then(() => {
         expectModalToBePresent();
         done();
       });
    });
  });

  afterEach(() => {
    mock.teardown();
  });
});
