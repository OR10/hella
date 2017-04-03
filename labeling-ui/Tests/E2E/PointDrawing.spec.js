import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('Point drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;
  
  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PointDrawing.Shared.Task,
      assets.mocks.PointDrawing.Shared.TaskConfiguration,
      assets.mocks.PointDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      //assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      //assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];
    
    viewer = element(by.css('.layer-container'));
  });
  
  it('should load and draw one point shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawOnePoint.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawOnePoint.LabeledThingInFrame.frameIndex0to4,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'LoadAndDrawOnePoint'),
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.LoadAndDrawOnePoint);
        done();
      });
  });
  
  it('should load and draw two point shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
          //() => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'LoadAndDrawTwoPoints')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.LoadAndDrawTwoPoints);
        done();
      });
  });
  
  it('should select a point shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectOnePoint')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectOnePoint);
        done();
      });
  });
  
  it('should select and deselect a point shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 150}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform();
      })
      .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectAndDeselectPoint')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectAndDeselectPoint);
        done();
      });
  });
  it('should select one and then select an other point shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 150}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'SelectAnotherPoint')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.SelectAnotherPoint);
        done();
      });
  });
  
  fit('should correctly move a point shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PointDrawing.MoveOnePoint.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));
    
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 150}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 250, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PointDrawing', 'MoveOnePoint')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PointDrawing.MoveOnePoint);
      })
      .then(() => browser.sleep(500))
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PointDrawing.MoveOnePoint.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });
  
});

