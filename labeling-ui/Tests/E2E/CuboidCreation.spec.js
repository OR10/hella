import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Cuboid creation', () => {
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

  describe('3d', () => {
    it('should create a new 3d cuboid starting top to bottom', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
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
          return browser.actions()
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
          return browser.actions()
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
          return browser.actions()
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
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1).toExistInPouchDb();
          done();
        });
    });

    it('should create a new 3d cuboid starting bottom to top', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
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
          return browser.actions()
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
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.DrawCuboids.StoreLabeledThingInFrame1).toExistInPouchDb();
          done();
        });
    });
  });

  describe('Pseudo 3d', () => {
    it('should create a new pseudo 3d cuboid starting top to bottom', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 405, y: 372}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 525}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dTopToBottom1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dTopToBottom1);
        })
        .then(() => {
          return browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 525}) // width
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dTopToBottom2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dTopToBottom2);
        })
        .then(() => {
          return browser.actions()
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dTopToBottom3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dTopToBottom3);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('x')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dTopToBottom4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dTopToBottom4);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.Pseudo3d.StoreLabeledThingInFrame).toExistInPouchDb();
          done();
        });
    });

    it('should create a new pseudo 3d cuboid starting bottom to top', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 405, y: 525}) // initial
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 372}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dBottomToTop1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dBottomToTop1);
        })
        .then(() => {
          return browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 525}) // width
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dBottomToTop2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dBottomToTop2);
        })
        .then(() => {
          return browser.actions()
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dBottomToTop3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dBottomToTop3);
        })
        .then(() => {
          return browser.actions()
            .sendKeys('x')
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'Pseudo3dBottomToTop4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.Pseudo3dBottomToTop4);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.Pseudo3d.StoreLabeledThingInFrame).toExistInPouchDb();
          done();
        });
    });
  });

  xdescribe('Size Constraints', () => {
    it('should create a new 3d cuboid with minimalHeight constraint starting top to bottom', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 405, y: 372}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 380}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'MinimalTopToBottom1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.MinimalTopToBottom1);
        })
        .then(() => {
          return browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 402}) // width
            .click()
            .mouseMove(viewer, {x: 637, y: 380}) // depth
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'MinimalTopToBottom2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.MinimalTopToBottom2);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.MinimalTopToBottom.StoreLabeledThingInFrame).toExistInPouchDb();
          done();
        });
    });

    it('should create a new 3d cuboid with minimalHeight constraint starting bottom to top', done => {
      mock(sharedMocks.concat([
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0,
        assets.mocks.CuboidCreation.DrawCuboids.LabeledThingInFrame.frameIndex0to1,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 405, y: 372}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 405, y: 362}) // drag
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'MinimalBottomToTop1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.MinimalBottomToTop1);
        })
        .then(() => {
          return browser.actions()
            .mouseUp()
            .mouseMove(viewer, {x: 673, y: 372}) // width
            .click()
            .mouseMove(viewer, {x: 647, y: 358}) // depth
            .click()
            .perform();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('CuboidCreation', 'MinimalBottomToTop2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.CuboidCreation.MinimalBottomToTop2);
          return browser.sleep(1000);
        })
        .then(() => {
          expect(assets.mocks.CuboidCreation.MinimalBottomToTop.StoreLabeledThingInFrame).toExistInPouchDb();
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
