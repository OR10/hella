import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';

describe('Metalabeling', () => {
  let assets;
  let sharedMocks;
  let labelSelector;
  let viewer;
  let metaLabelingButton;
  let incompleteBadge;

  /**
   * @type {LabelSelectorHelper}
   */
  let labelSelectorHelper;

  function clickRectangleOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 110, y: 110})
      .click()
      .perform();
  }

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
    labelSelector = element(by.css('label-selector'));
    metaLabelingButton = element(by.css('.tool-frame-shape'));
    incompleteBadge = element(by.css('.badge-container .badge'));

    labelSelectorHelper = new LabelSelectorHelper(labelSelector);
  });

  describe('Basic behaviour', () => {
    beforeEach(() => {
      mock(sharedMocks.concat([
        assets.mocks.MetaLabeling.Shared.Task,
        assets.mocks.MetaLabeling.Shared.TaskConfiguration,
        assets.mocks.MetaLabeling.Shared.RequirementsXmlFile,
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.frameIndex0,
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.getLabeledThingInFrame0to4,
      ]));
    });

    it('should show incomplete object if meta labeling is activated and frame one is not labeled', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => incompleteBadge.getText())
        // Two incomplete shapes + One incomplete/not existent frame
        .then(incompleteCount => expect(incompleteCount).toEqual('3'))
        .then(() => done());
    });

    it('updates the incomplete number when completing the meta labeling', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => metaLabelingButton.click())
        .then(() => browser.sleep(150))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => browser.sleep(150))
        .then(() => incompleteBadge.getText())
        .then(incompleteCount => expect(incompleteCount).toEqual('2'))
        .then(() => done());
    });

    it('should show the correct labels before and after switching to meta labeling', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(150))
        .then(() => expect(labelSelectorHelper.getTitleTexts()).toEqual(['Sign type']))
        .then(() => metaLabelingButton.click())
        .then(() => browser.sleep(150))
        .then(() => expect(labelSelectorHelper.getTitleTexts()).toEqual(['Time']))
        .then(() => done());
    });
  });

  describe('No Metalabeling (TTANNO-1670)', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.MetaLabeling.Shared.Task,
        assets.mocks.MetaLabeling.Shared.TaskConfiguration,
        assets.mocks.MetaLabeling.NoMetaLabeling.RequirementsXmlFile,
      ]);
    });

    it('is not incomplete if Metalabeling is not active (no shapes exist)', done => {
      mock(sharedMocks);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => incompleteBadge.getText())
        .then(incompleteCount => expect(incompleteCount).toEqual(''))
        .then(done);
    });

    it('is not incomplete if Metalabeling is not active (shapes exist)', done => {
      mock(sharedMocks.concat([
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.frameIndex0,
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.MetaLabeling.Shared.LabeledThingInFrame.getLabeledThingInFrame0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => incompleteBadge.getText())
        .then(incompleteCount => expect(incompleteCount).toEqual('2'))
        .then(done);
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
