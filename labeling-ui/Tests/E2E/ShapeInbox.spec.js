import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
  shortSleep,
  sendKeys,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('ShapeInbox', () => {
  let assets;
  let viewer;
  let shapeInboxBadge;
  let shapeInboxButton;
  let shapeInboxSelectedList;
  let shapeInboxSavedList;
  let sharedMocks;
  let firstPlusButton;
  let secondPlusButton;
  let firstMinusButton;
  let secondMinusButton;
  let headerPlusButton;
  let headerMinusButton;
  let nextFrameButton;
  let previousFrameButton;

  const firstShape = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondShape = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

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
      assets.documents.ShapeInbox.DrawTwoRectangles,
    ]);

    viewer = element(by.css('.layer-container'));
    shapeInboxBadge = element(by.css('.task-bar .badge'));
    shapeInboxButton = element(by.css('.task-bar .icon.fa-inbox'));
    shapeInboxSelectedList = element(by.css('#popup-inbox-selected .popup-inbox-list'));
    shapeInboxSavedList = element(by.css('#popup-inbox-saved .popup-inbox-list'));

    headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
    headerMinusButton = element(by.css('#popup-inbox-saved .shape-list-header .icon'));

    const plusButtons = shapeInboxSelectedList.all(by.css('.selected-shape .icon.fa-plus-circle'));
    const minusButtons = shapeInboxSavedList.all(by.css('.selected-shape .icon.fa-minus-circle'));

    firstPlusButton = plusButtons.get(0);
    secondPlusButton = plusButtons.get(1);

    firstMinusButton = minusButtons.get(0);
    secondMinusButton = minusButtons.get(1);

    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
  });


  describe('Badge', () => {
    it('does not show a badge if no shape is saved', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('does show a badge if one shape is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('does not show a badge if two shapes are selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('shows a badge if one shape is saved', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
        .then(() => done());
    });

    it('shows a badge if two shapes are saved', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('2'))
        .then(() => done());
    });

    it('shows a badge if first two shapes are saved and then one is unsaved', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => firstMinusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
        .then(() => done());
    });

    it('does not show a badge if first two shapes are svaed and then removed from inbox', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => headerMinusButton.click())
        .then(() => shortSleep())
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
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a popup with the names of the two selected shapes when clicking the inbox icon', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a and closes popup with the names of the two selected shapes when clicking the badge', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual(''))
        .then(() => shapeInboxBadge.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });

    it('changes the popup text while open and selection changes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
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
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => shortSleep())
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
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('changes the popup text while closed and selection changes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))

        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => ctrlClickSecondShape())
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('shows shapes that have just been ghostbusted (TTANNO-2152)', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .mouseDown()
            .mouseMove(viewer, secondShape.topLeft)
            .mouseUp()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => done());
    });
  });

  describe('Adding and removing shapes', () => {
    it('moves one shape from selected shapes to saved shapes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => secondPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #2'))
        .then(() => done());
    });

    it('moves two shapes from selected shapes to saved shapes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => secondPlusButton.click())
        .then(() => shortSleep())
        .then(() => firstPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #2\nrectangle #1'))
        .then(() => done());
    });

    it('moves one shape from saved shapes to selected shapes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => secondPlusButton.click())
        .then(() => shortSleep())
        .then(() => firstMinusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('moves two shapes from saved shapes to selected shapes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => secondPlusButton.click())
        .then(() => shortSleep())
        .then(() => firstPlusButton.click())
        .then(() => shortSleep())
        .then(() => secondMinusButton.click())
        .then(() => shortSleep())
        .then(() => firstMinusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('adds all the shapes with one click', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });

    it('removes all the shapes with one click', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => headerMinusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('keeps the saved shapes over a framechange with the popup open', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });

    it('keeps the saved shapes over a framechange with the popup closed', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
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
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });
  });

  describe('Meta Labeling', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.MetaLabeling.Shared.Task,
        assets.mocks.MetaLabeling.Shared.TaskConfiguration,
        assets.mocks.MetaLabeling.Shared.RequirementsXmlFile,
      ]));
    });

    it('does not show a badge if meta labeling is selected', done => {
      const metaLabelingButton = element(by.css('.tool-frame-shape'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => metaLabelingButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('opens a popup window with the text "No shapes selected" if meta labeling is selected', done => {
      const metaLabelingButton = element(by.css('.tool-frame-shape'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => metaLabelingButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });
  });

  describe('Shape Reselection', () => {
    it('show reselection button for shapes added to inbox', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          expect(
            element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share'))
              .isPresent()
          )
            .toBeTruthy();
        })
        .then(() => done());
    });

    it('show reselection button for multiple shapes added to inbox', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).count())
        .then(elementCount => expect(elementCount).toEqual(2))
        .then(() => done());
    });

    it('reselect shape on another frame', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 2, y: 2})
            .click()
            .perform();
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'SimpleReselect')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.SimpleReselect);
        })
        .then(() => done());
    });

    it('switch shapes by reselection', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 2, y: 2})
            .click()
            .perform();
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).get(0).click())
        .then(() => mediumSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).get(0).click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'ReselectDifferentShapes')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.ReselectDifferentShapes);
        })
        .then(() => done());
    });

    it('reselect shape on another frame, move and store it', done => {
      const dragPoint = {x: firstShape.topLeft.x + 10, y: firstShape.topLeft.y + 10};
      const dragTarget = {x: dragPoint.x + 100, y: dragPoint.y + 100};

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 2, y: 2})
            .click()
            .perform();
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, dragPoint)
            .mouseDown()
            .mouseMove(viewer, dragTarget)
            .mouseUp()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.documents.ShapeInbox.MoveReselectedRectangle).toExistInPouchDb();
        })
        .then(() => done());
    });
  });

  describe('Jumping to a shape', () => {
    const jumpToButton = element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-map-marker'));

    it('selects the shape if on the same frame', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1})
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'JumpToShapeSameFrameDeselected')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.JumpToShapeSameFrameDeselected);
        })
        .then(() => jumpToButton.click())
        .then(() => shortSleep())

        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'JumpToShapeSameFrameSelected')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.JumpToShapeSameFrameSelected);
        })
        .then(() => done());
    });

    it('selects the shape if on another frame', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1})
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => jumpToButton.click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'JumpToShapeSameFrameSelected')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.JumpToShapeSameFrameSelected);
        })
        .then(() => done());
    });

    it('selects the shape if on another frame and different shape selected', done => {
      const thirdShape = {
        topLeft: {x: 450, y: 250},
        bottomRight: {x: 550, y: 450},
      };

      bootstrapPouch([
        assets.documents.ShapeInbox.DrawTwoRectangles,
        assets.documents.ShapeInbox.DrawOneRectangleOnFrameTwo,
      ]);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, thirdShape.topLeft)
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => jumpToButton.click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'JumpToShapeSameFrameSelected')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.JumpToShapeSameFrameSelected);
        })
        .then(() => done());
    });

    it('selects the shape if on same frame but different shape selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => shapeInboxButton.click())
        .then(() => shortSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft)
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => jumpToButton.click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'JumpToShapeSameFrameSelected')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.JumpToShapeSameFrameSelected);
        })
        .then(() => done());
    });
  });

  describe('Shape Renaming', () => {
    const selectedShapeSpan = element(by.css('#popup-inbox-selected .popup-inbox-list .selected-shape span'));
    const savedShapeSpan = element(by.css('#popup-inbox-saved .popup-inbox-list .selected-shape span'));

    function clickSelectedShapeSpan() {
      return Promise.resolve()
        .then(() => {
          return browser.actions()
            .click(selectedShapeSpan)
            .perform();
        })
        .then(() => shortSleep());
    }

    function clickSavedShapeSpan() {
      return Promise.resolve()
        .then(() => {
          return browser.actions()
            .click(savedShapeSpan)
            .perform();
        })
        .then(() => shortSleep());
    }

    function deselectShapes() {
      return Promise.resolve()
        .then(() => {
          return browser.actions()
            .click(viewer, {x: 1, y: 1})
            .perform();
        })
        .then(() => shortSleep());
    }

    function sendStringWithEnter(keys) {
      return Promise.resolve()
        .then(() => sendKeys([keys, protractor.Key.ENTER]))
        .then(() => mediumSleep());
    }

    function sendKeysWithEnter(keys) {
      return Promise.resolve()
        .then(() => sendKeys([...keys, protractor.Key.ENTER]))
        .then(() => mediumSleep());
    }

    beforeEach(done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => done());
    });

    it('should display selected shape names as contenteditable element', done => {
      Promise.resolve()
        .then(() => selectedShapeSpan.getAttribute('contenteditable'))
        .then(contenteditable => expect(contenteditable).toEqual('true'))
        .then(() => done());
    });

    it('should display saved shape names as contenteditable element', done => {
      Promise.resolve()
        .then(() => savedShapeSpan.getAttribute('contenteditable'))
        .then(contenteditable => expect(contenteditable).toEqual('true'))
        .then(() => done());
    });

    it('should overwrite currently selected name if clicked', done => {
      const newName = 'Captain Archer!';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should overwrite stored name if clicked', done => {
      const newName = 'Captain Picard?';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => expect(savedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should allow manipulation of already set name of selected shape, if cursor keys are used', done => {
      const keys = [protractor.Key.ARROW_RIGHT, protractor.Key.BACK_SPACE, '42'];
      const newName = 'rectangle #42';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendKeysWithEnter(keys))
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should allow manipulation of already set name of saved shape, if cursor keys are used', done => {
      const keys = [protractor.Key.ARROW_RIGHT, protractor.Key.BACK_SPACE, '42'];
      const newName = 'rectangle #42';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendKeysWithEnter(keys))
        .then(() => expect(savedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should flip back to original string of selected shape if empty string is entered', done => {
      const keys = [protractor.Key.BACK_SPACE];
      const oldName = 'rectangle #2';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendKeysWithEnter(keys))
        .then(() => expect(selectedShapeSpan.getText()).toEqual(oldName))
        .then(() => done());
    });

    it('should flip back to original string of saved shape if empty string is entered', done => {
      const keys = [protractor.Key.BACK_SPACE];
      const oldName = 'rectangle #1';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendKeysWithEnter(keys))
        .then(() => expect(savedShapeSpan.getText()).toEqual(oldName))
        .then(() => done());
    });

    it('should flip back to original string of selected shape if ESC is pressed', done => {
      const keys = ['Captain Kirk!', protractor.Key.ESCAPE];
      const oldName = 'rectangle #2';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendKeys(keys))
        .then(() => expect(selectedShapeSpan.getText()).toEqual(oldName))
        .then(() => done());
    });

    it('should flip back to original string of saved shape if ESC is pressed', done => {
      const keys = ['Captain Lorca?', protractor.Key.ESCAPE];
      const oldName = 'rectangle #1';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendKeys(keys))
        .then(() => expect(savedShapeSpan.getText()).toEqual(oldName))
        .then(() => done());
    });

    it('should support a defined set of special characters for selected names', done => {
      const characters = '.:;-_#+*!"§$%&/()=?@<>';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(characters))
        .then(() => expect(selectedShapeSpan.getText()).toEqual(characters))
        .then(() => done());
    });

    it('should support a defined set of special characters for saved names', done => {
      const characters = '.:;-_#+*!"§$%&/()=?@<>';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendStringWithEnter(characters))
        .then(() => expect(savedShapeSpan.getText()).toEqual(characters))
        .then(() => done());
    });

    it('should keep the name of selected element if it is deselected and selected again', done => {
      const newName = 'Captain Janeway.';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => deselectShapes())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should keep the name of a saved element when it is removed from the inbox', done => {
      const newName = 'Captain Pike!';

      Promise.resolve()
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => clickSavedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => {
          return browser.actions()
            .click(headerMinusButton)
            .perform();
        })
        .then(() => shortSleep())
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it(
      'should keep the name of a saved element when it is removed from the inbox and later on selected again',
      done => {
        const newName = 'Captain Sisko?';

        Promise.resolve()
          .then(() => clickSavedShapeSpan())
          .then(() => sendStringWithEnter(newName))
          .then(() => {
            return browser.actions()
              .click(headerMinusButton)
              .perform();
          })
          .then(() => shortSleep())
          .then(() => {
            return browser.actions()
              .mouseMove(viewer, firstShape.topLeft)
              .click()
              .perform();
          })
          .then(() => mediumSleep())
          .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
          .then(() => done());
      }
    );

    it('should keep the name of a selected element when popup panel is closed and reopened', done => {
      const newName = 'Ambassador Sarek!';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => {
          return browser.actions()
            .click(shapeInboxButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .click(shapeInboxButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should keep the name of a saved element when popup panel is closed and reopened', done => {
      const newName = 'Captain Sulu?';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => {
          return browser.actions()
            .click(shapeInboxButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .click(shapeInboxButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(savedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should keep the name of a saved element during frame change', done => {
      const newName = 'Ambassador Spock';

      Promise.resolve()
        .then(() => clickSavedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => {
          return browser.actions()
            .click(nextFrameButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(savedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should keep the name of a selected and unghosted element during frame change', done => {
      const newName = 'Captain Riker...';

      Promise.resolve()
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => {
          return browser.actions()
            .click(nextFrameButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: secondShape.topLeft.x + 10, y: secondShape.topLeft.y + 10})
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 300})
            .mouseUp()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });

    it('should inherit name change to other frames', done => {
      const newName = 'Commodore Wesley';

      Promise.resolve()
        .then(() => {
          return browser.actions()
            .click(nextFrameButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: secondShape.topLeft.x + 10, y: secondShape.topLeft.y + 10})
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 300})
            .mouseUp()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => deselectShapes())
        .then(() => {
          return browser.actions()
            .click(previousFrameButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => clickSelectedShapeSpan())
        .then(() => sendStringWithEnter(newName))
        .then(() => deselectShapes())
        .then(() => {
          return browser.actions()
            .click(nextFrameButton)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 500, y: 300})
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(selectedShapeSpan.getText()).toEqual(newName))
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
