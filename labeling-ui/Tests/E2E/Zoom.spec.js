import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import ImageComparisionService from '../Support/ImageComparisonService';
import InteractionService from '../Support/InteractionService';
import {initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);
const imageComparision = new ImageComparisionService();
const interaction = new InteractionService();

describe('Zoom', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Zoom.Shared.Task,
      assets.mocks.Zoom.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Zoom.Shared.FrameLocations.Source.frameIndex0,
      assets.mocks.Zoom.Shared.FrameLocations.Source.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should zoom in on center point using keyboard shortcut', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .sendKeys('+')
          .sendKeys('+')
          .sendKeys('+')
          .sendKeys('+')
          .sendKeys('+')
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyCenterKeyboard')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyCenterKeyboard, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  it('should zoom in on center point using mousewheel', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        () => {
          interaction.mouseWheelAtRepeat('.event-delegation-layer', 1024 / 2, 620 / 2, 0, -120, 10);
        }
      )
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyCenterMouseWheel')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyCenterMouseWheel, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  it('should zoom in on top left region using mousewheel', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        () => {
          interaction.mouseWheelAtRepeat('.event-delegation-layer', 50, 50, 0, -120, 10);
        }
      )
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyTopLeftMouseWheel')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyTopLeftMouseWheel, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  it('should zoom in on bottom left region using mousewheel', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        () => {
          interaction.mouseWheelAtRepeat('.event-delegation-layer', 1024 - 50, 50, 0, -120, 10);
        }
      )
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyBottomLeftMouseWheel')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyBottomLeftMouseWheel, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  it('should zoom in on top right region using mousewheel', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        () => {
          interaction.mouseWheelAtRepeat('.event-delegation-layer', 50, 620 - 50, 0, -120, 10);
        }
      )
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyTopRightMouseWheel')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyTopRightMouseWheel, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  it('should zoom in on bottom right region using mousewheel', done => {
    mock(sharedMocks.concat([
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        () => {
          interaction.mouseWheelAtRepeat('.event-delegation-layer', 1024 - 50, 620 - 50, 0, -120, 10);
        }
      )
      .then(
        // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'EmptyBottomRightMouseWheel')
        () => canvasInstructionLogManager.getBackgroundCanvasImage()
      )
      .then(
        encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.EmptyBottomRightMouseWheel, true, true)
      )
      .then(diff => {
        expect(diff).toMatchBelowThreshold(0.01);
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
