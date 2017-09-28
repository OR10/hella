import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Default Shape Creation (TTANNO-1370)', () => {
  let assets;
  let sharedMocks;
  let defaultShapeCreationButton;

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
      assets.mocks.DefaultShapeCreation.Shared.Video,
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
      assets.mocks.DefaultShapeCreation.Shared.StoreLabeledThing,
    ];

    defaultShapeCreationButton = element(by.css('#default-shape-creation-button'));
  });

  it('should create and draw a *Rectangle* (TTANNO-1370)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Rectangle.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.DefaultShapeCreation.Rectangle.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Rectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.DefaultShapeCreation.Rectangle);
      })
      .then(() => done());
  });

  it('should create and draw a *Pedestrian* (TTANNO-1370)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Pedestrian.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.DefaultShapeCreation.Pedestrian.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Pedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.DefaultShapeCreation.Pedestrian);
      })
      .then(() => done());
  });

  it('should create and draw a *Polygon* (TTANNO-1370)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Polygon.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.DefaultShapeCreation.Polygon.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Polygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.DefaultShapeCreation.Polygon);
      })
      .then(() => done());
  });

  it('should create and draw a *Cuboid* (TTANNO-1370)', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.DefaultShapeCreation.Cuboid.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => defaultShapeCreationButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.DefaultShapeCreation.Cuboid.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('DefaultShapeCreation', 'Cuboid')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.DefaultShapeCreation.Cuboid);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
  });
});
