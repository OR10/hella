import using from '../Support/Protractor/DataProvider';
import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import ImageComparisionService from '../Support/ImageComparisonService';
import InteractionService from '../Support/InteractionService';
import {expectAllModalsToBeClosed, initApplication} from '../Support/Protractor/Helpers';
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
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  describe('Without shapes', () => {
    it('should zoom in on center point using keyboard shortcuts', done => {
      mock(sharedMocks.concat([
        assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
        assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

    it('should pan the scene using shift + mousedrag', done => {
      mock(sharedMocks.concat([
        assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
        assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          browser.actions()
            .sendKeys('+')
            .sendKeys('+')
            .sendKeys('+')
            .sendKeys('+')
            .sendKeys('+')
            .perform();

          browser.actions()
            .mouseMove(viewer, {x: 500, y: 500})
            .sendKeys(protractor.Key.SHIFT)
            .mouseDown()
            .mouseMove(viewer, {x: 100, y: 100})
            .mouseUp()
            .sendKeys(protractor.Key.SHIFT)
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getBackgroundCanvasImage('Zoom', 'PannedEmptyKeyboard')
          () => canvasInstructionLogManager.getBackgroundCanvasImage()
        )
        .then(
          encodedImageData => imageComparision.compare(encodedImageData, assets.fixtures.Canvas.Zoom.PannedEmptyKeyboard, true, true)
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
      it('should zoom in at different positions using mousewheel', done => {
        mock(sharedMocks.concat([
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0,
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
        ]));

        initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

  describe('With Shapes', () => {
    using([
      [1024 / 2, 620 / 2, 'AnnotationCenterMouseWheel'],
      [50, 50, 'AnnotationTopLeftMouseWheel'],
      [50, 620 - 50, 'AnnotationBottomLeftMouseWheel'],
      [1024 - 50, 50, 'AnnotationTopRightMouseWheel'],
      [1024 - 50, 620 - 50, 'AnnotationBottomRightMouseWheel'],
    ], (xTarget, yTarget, fixtureName) => {
      it('should zoom in at different positions using mousewheel', done => {
        mock(sharedMocks.concat([
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Annotation.frameIndex0,
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Annotation.frameIndex0to4,
        ]));

        initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(
            () => {
              interaction.mouseWheelAtRepeat('.event-delegation-layer', xTarget, yTarget, 0, -120, 20);
            }
          )
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('Zoom', fixtureName)
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.Zoom[fixtureName]);
            done();
          });
      });
    });

    using([
      [1024 / 2, 620 / 2, 'SelectedAnnotationCenterMouseWheel', 100, 100],
      [50, 50, 'SelectedAnnotationTopLeftMouseWheel', 100, 100],
      [50, 620 - 50, 'SelectedAnnotationBottomLeftMouseWheel', 100, 410],
      [1024 - 50, 50, 'SelectedAnnotationTopRightMouseWheel', 612, 100],
      [1024 - 50, 620 - 50, 'SelectedAnnotationBottomRightMouseWheel', 612, 410],
    ], (xTarget, yTarget, fixtureName, selectX, selectY) => {
      it('should select a shape and then zoom in at different positions using mousewheel', done => {
        mock(sharedMocks.concat([
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Annotation.frameIndex0,
          assets.mocks.Zoom.Shared.LabeledThingInFrame.Annotation.frameIndex0to4,
        ]));

        initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
          .then(
            () => {
              browser.actions()
                .mouseMove(viewer, {x: selectX + 50, y: selectY + 50})
                .click()
                .perform();
              interaction.mouseWheelAtRepeat('.event-delegation-layer', xTarget, yTarget, 0, -120, 20);
            }
          )
          .then(
            // () => canvasInstructionLogManager.getAnnotationCanvasLogs('Zoom', fixtureName)
            () => canvasInstructionLogManager.getAnnotationCanvasLogs()
          )
          .then(drawingStack => {
            expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.Zoom[fixtureName]);
            done();
          });
      });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
