import {expectAllModalsToBeClosed, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';
import featureFlags from '../../Application/features.json';
import {cloneDeep} from 'lodash';

describe('Class Ghosting', () => {
  if (!featureFlags.pouchdb) {
    pending('These tests only work with activated Pouch');
  }

  let assets;
  let sharedMocks;
  let viewer;
  let labelSelector;
  let labelSelectorHelper;
  let nextFrameButton;
  let previousFrameButton;

  function createLtifFromTemplate(frameIndex, classes, topLeft = {x: 100, y: 100}, bottomRight = {x: 200, y: 200}) {
    const ltifTemplate = cloneDeep(assets.documents.ClassGhosting.LtifTemplate);

    ltifTemplate.frameIndex = frameIndex;
    ltifTemplate.classes = classes;
    ltifTemplate.shapes[0].topLeft = topLeft;
    ltifTemplate.shapes[0].bottomRight = bottomRight;

    return ltifTemplate;
  }

  function createRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 100, y: 100}) // Rectangle in first frame
      .mouseDown()
      .mouseMove(viewer, {x: 200, y: 200}) // Rectangle in first frame
      .mouseUp()
      .perform();
  }

  function moveRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 150, y: 150}) // Rectangle in first frame
      .mouseDown()
      .mouseMove(viewer, {x: 600, y: 400}) // Rectangle in first frame
      .mouseUp()
      .perform();
  }

  function expectUTurnEntrySelected() {
    return Promise.resolve()
      .then(() => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Sign type')).toEqual(
        {
          'U-Turn': true,
          'Speed sign': false,
        }
      ));
  }

  function expectSpeedSignEntrySelected() {
    return Promise.resolve()
      .then(() => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Sign type')).toEqual(
        {
          'U-Turn': false,
          'Speed sign': true,
        }
      ));
  }

  function selectUTurnEntry() {
    return Promise.resolve()
      .then(() => labelSelectorHelper.getOpenStateByTitleText('Sign type'))
      .then(open => {
        if (!open) {
          return labelSelectorHelper.getTitleClickTargetFinderByTitleText('Sign type').click();
        }
      })
      .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Sign type', 'U-Turn').click());
  }

  function selectSpeedSignEntry() {
    return Promise.resolve()
      .then(() => labelSelectorHelper.getOpenStateByTitleText('Sign type'))
      .then(open => {
        if (!open) {
          return labelSelectorHelper.getTitleClickTargetFinderByTitleText('Sign type').click();
        }
      })
      .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Sign type', 'Speed sign').click());
  }


  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
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
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
      assets.mocks.ClassGhosting.Task,
      assets.mocks.ClassGhosting.TaskConfiguration,
      assets.mocks.ClassGhosting.TaskConfigurationFile,
    ];

    viewer = element(by.css('.layer-container'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    labelSelector = element(by.css('label-selector'));

    labelSelectorHelper = new LabelSelectorHelper(labelSelector);
  });

  it('should set attribute on non ghosts', done => {
    mock(sharedMocks.concat([]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => createRectangle())
      .then(() => selectUTurnEntry())
      .then(() => expectUTurnEntrySelected())
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => done());
  });

  it('should transfer attributes to shape ghosts', done => {
    mock(sharedMocks.concat([]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => createRectangle())
      .then(() => selectUTurnEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => expectUTurnEntrySelected())
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, [])).not.toExistInPouchDb())
      .then(() => done());
  });

  it('should create ghosts classes on manifested ghosts', done => {
    mock(sharedMocks.concat([]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => createRectangle())
      .then(() => selectUTurnEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => moveRectangle())
      .then(() => browser.sleep(100))
      .then(() => expectUTurnEntrySelected())
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, [])).not.toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(2, [], {x: 550, y: 350}, {x: 650, y: 450})).toExistInPouchDb())
      .then(() => done());
  });

  it('should propagate class changes through ghost classes', done => {
    mock(sharedMocks.concat([]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => createRectangle())
      .then(() => selectUTurnEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => moveRectangle())
      .then(() => browser.sleep(100))
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, [])).not.toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(2, [], {x: 550, y: 350}, {x: 650, y: 450})).toExistInPouchDb())
      .then(() => selectSpeedSignEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => expectSpeedSignEntrySelected())
      .then(() => expect(createLtifFromTemplate(0, ['speed-sign'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, [])).not.toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(2, [], {x: 550, y: 350}, {x: 650, y: 450})).toExistInPouchDb())
      .then(() => done());
  });

  it('should propagate class changes through ghost classes', done => {
    mock(sharedMocks.concat([]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => createRectangle())
      .then(() => selectUTurnEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => moveRectangle())
      .then(() => browser.sleep(100))
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, [])).not.toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(2, [], {x: 550, y: 350}, {x: 650, y: 450})).toExistInPouchDb())
      .then(() => selectSpeedSignEntry())
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(100))
      .then(() => expectSpeedSignEntrySelected())
      .then(() => expect(createLtifFromTemplate(0, ['u-turn'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(1, ['speed-sign'])).toExistInPouchDb())
      .then(() => expect(createLtifFromTemplate(2, [], {x: 550, y: 350}, {x: 650, y: 450})).toExistInPouchDb())
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
