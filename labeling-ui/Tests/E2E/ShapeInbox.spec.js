import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

fdescribe('ShapeInbox', () => {
  let assets;
  let viewer;
  let shapeInboxBadge;
  let shapeInboxButton;
  let shapeInboxSelectedList;
  let shapeInboxSavedList;

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
    shapeInboxButton = element(by.css('.task-bar .icon.fa-inbox'));
    shapeInboxSelectedList = element(by.css('#popup-inbox-selected .popup-inbox-list'));
    shapeInboxSavedList = element(by.css('#popup-inbox-saved .popup-inbox-list'));
  });


  describe('Badge', () => {
    it('does not show a badge if no shape is selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('shows a badge if one shape is selected', done => {
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

    it('shows a badge if two shapes are selected', done => {
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

    it('shows a badge if first two shapes are selected and then one is deselected', done => {
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
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
        .then(() => done());
    });

    it('does not show a badge if first two shapes are selected and then deselected by clicking into the viewer', done => {
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
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });
  });

  describe('Popup', () => {
    const ctrlClickSecondShape = () => {
      return browser.actions()
        .sendKeys(protractor.Key.CONTROL)
        .mouseMove(viewer, secondShape.topLeft) // initial position
        .click()
        .sendKeys(protractor.Key.NULL)
        .perform();
    };

    it('opens a popup window with the text "No shapes selected" if no shapes are selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a popup with the names of the two selected shapes when clicking the inbox icon', done => {
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
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a popup with the names of the two selected shapes when clicking the badge', done => {
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
        .then(() => shapeInboxBadge.click())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('changes the popup text while open and selection changes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
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
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('changes the popup text while closed and selection changes', done => {
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
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))

        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => ctrlClickSecondShape())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => browser.sleep(250))
        .then(() => shapeInboxButton.click())
        .then(() => browser.sleep(250))
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });
  });

  fdescribe('Adding and removing shapes', () => {
    let firstShapePlusButton;
    let secondShapePlusButton;

    beforeEach(() => {
      const plusButtons = shapeInboxSelectedList.all(by.css('.selected-shape .icon.fa-plus-circle'));
      firstShapePlusButton = plusButtons.get(0);
      secondShapePlusButton = plusButtons.get(1);
    });

    it('moves one shape from selected shapes to saved shapes', done => {
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
        .then(() => secondShapePlusButton.click())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #2'))
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
