import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle viewer overflow', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
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

    viewer = element(by.css('.layer-container'));
  });

  it('should allow overflowing of a rectangle in the top-left corner', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 190, y: 190}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 2, y: 2}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftOverflow);
      })
      .then(() => done());
  });

  it('should allow overflowing of a rectangle in the bottom-right corner', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 1023, y: 619}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.Overflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'BottomRightOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.BottomRightOverflow);
      })
      .then(() => done());
  });

  it('should restrict overflowing of a rectangle in the top left corner', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 190, y: 190}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 2, y: 2}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftNoOverflow);
      })
      .then(() => done());
  });

  it('should restrict overflowing of a rectangle in the bottom right corner', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 1023, y: 619}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())

      .then(() => {
        expect(assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'BottomRightNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.BottomRightNoOverflow);
      })
      .then(() => done());
  });

  it('should should correctly enforce shape overflows (bottom) (TTANNO-1324)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.WideBottom.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 50, y: 15}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 605}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'WideBottomNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.WideBottomNoOverflow);
      })
      .then(() => done());
  });

  it('should should correctly enforce shape overflows (top) (TTANNO-1324)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.WideTop.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 50, y: 605})
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 15})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'WideTopNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.WideTopNoOverflow);
      })
      .then(() => done());
  });

  it('should should correctly enforce shape overflows (left) (TTANNO-1324)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.TallLeft.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 15, y: 50})
          .mouseDown()
          .mouseMove(viewer, {x: 1015, y: 50})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TallLeftNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TallLeftNoOverflow);
      })
      .then(() => done());
  });

  it('should should correctly enforce shape overflows (right) (TTANNO-1324)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
    ]));

    bootstrapPouch([
      assets.documents.RectangleOverflow.TallRight.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1015, y: 50})
          .mouseDown()
          .mouseMove(viewer, {x: 15, y: 50})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.NoOverflow).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TallRightNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TallRightNoOverflow);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
