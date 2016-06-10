import using from '../Support/Protractor/DataProvider';
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

  describe('Background', () => {
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

    using([
      [1024 / 2, 620 / 2, 'EmptyCenterMouseWheel'],
      [50, 50, 'EmptyTopLeftMouseWheel'],
      [50, 620 - 50, 'EmptyBottomLeftMouseWheel'],
      [1024 - 50, 50, 'EmptyTopRightMouseWheel'],
      [1024 - 50, 620 - 50, 'EmptyBottomRightMouseWheel'],
    ], (xTarget, yTarget, fixtureName) => {
      it('should zoom in background mousewheel', done => {
        mock(sharedMocks.concat([
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
        ]));

        initApplication('/labeling/task/TASKID-TASKID')
          .then(
            () => {
              interaction.mouseWheelAtRepeat('.event-delegation-layer', xTarget, yTarget, 0, -120, 10);
            }
          )
          .then(
            // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', fixtureName)
            () => canvasInstructionLogManager.getBackgroundCanvasImage()
          )
          .then(
            encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom[fixtureName], true, true)
          )
          .then(diff => {
            expect(diff).toMatchBelowThreshold(0.01);
            done();
          });
      });
    });
  });

  afterEach(() => {
    mock.teardown();
  });
});
