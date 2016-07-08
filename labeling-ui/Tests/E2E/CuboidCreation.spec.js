import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  initApplication,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cuboid', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
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
    ];

    viewer = element(by.css('.layer-container'));
  });

  describe('Creation', () => {
    it('should create a new 3d cuboid starting top to bottom', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
        assets.mocks.CuboidCreation.Shared.StoreLabeledThing,
        assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1,
      ]));

      initApplication('/labeling/task/TASKID-TASKID', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 405, y: 372}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 525}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboid1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboid1);
        })
        .then(() => {
          browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 525}) // width
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboid2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboid2);
        })
        .then(() => {
          browser.actions()
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboid3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboid3);
        })
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 673, y: 486}) // depth
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboid4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboid4);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainNamedParamsRequest(assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1);
          done();
        });
    });

    it('should create a new 3d cuboid starting bottom to top', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
        assets.mocks.CuboidCreation.Shared.StoreLabeledThing,
        assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1,
      ]));

      initApplication('/labeling/task/TASKID-TASKID', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          browser.actions()
            .mouseMove(viewer, {x: 405, y: 525}) // initial
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 372}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboidBottomToTop1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboidBottomToTop1);
        })
        .then(() => {
          browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 525}) // width
            .click()
            .mouseMove(viewer, {x: 673, y: 486}) // depth
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'DrawMiddleCuboidBottomToTop2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.DrawMiddleCuboidBottomToTop2);
          browser.sleep(1000);
        })
        // .then(() => dumpAllRequestsMade(mock))
        .then(() => getMockRequestsMade(mock))
        .then(requests => {
          expect(requests).toContainNamedParamsRequest(assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1);
          done();
        });
    });
  });


  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
