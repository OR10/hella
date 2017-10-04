import { inject } from 'angular-mocks';
import ShapeMergeService from 'Application/Common/Services/ShapeMergeService';

fdescribe('ShapeMergeService', () => {
  /**
   * @type {ShapeMergeService}
   */
  let service;

  /**
   * @type {LabeledThingInFrameGateway}
   */
  let labeledThingInFrameGateway;

  /**
   * @type {$q}
   */
  let angularQ;

  /**
   * @type {$rootScope}
   */
  let rootScope;

  /**
   * @type {LabeledThingGateway}
   */
  let labeledThingGateway;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    labeledThingInFrameGateway = jasmine.createSpyObj('labeledThingInFrameGateway', ['saveLabeledThingInFrame']);
    labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['getAssociatedLabeledThingsInFrames', 'deleteLabeledThing']);
    service = new ShapeMergeService(rootScope, angularQ, labeledThingInFrameGateway, labeledThingGateway);
  });

  it('can be created', () => {
    expect(service).toEqual(jasmine.any(ShapeMergeService));
  });

  describe('mergeShapes', () => {
    let firstFrameRange;
    let secondFrameRange;
    let thirdFrameRange;
    let firstLabeledThing;
    let secondLabeledThing;
    let thirdLabeledThing;
    let firstLabeledThingInFrame;
    let secondLabeledThingInFrame;
    let thirdLabeledThingInFrame;
    let firstShape;
    let secondShape;
    let thirdShape;
    let mergableShapes;
    let associatedLabeledThingsInFrame;

    beforeEach(() => {
      firstFrameRange = {startFrameIndex: 0, endFrameIndex: 0};
      secondFrameRange = {startFrameIndex: 3, endFrameIndex: 3};
      thirdFrameRange = {startFrameIndex: 7, endFrameIndex: 7};

      firstLabeledThing = {ltid: 1, frameRange: firstFrameRange};
      secondLabeledThing = {ltid: 2, frameRange: secondFrameRange};
      thirdLabeledThing = {ltid: 3, frameRange: thirdFrameRange};

      firstLabeledThingInFrame = {litfid: 1, labeledThing: firstLabeledThing};
      secondLabeledThingInFrame = {litfid: 1, labeledThing: secondLabeledThing};
      thirdLabeledThingInFrame = {litfid: 1, labeledThing: thirdLabeledThing};

      firstShape = {labeledThingInFrame: firstLabeledThingInFrame};
      secondShape = {labeledThingInFrame: secondLabeledThingInFrame};
      thirdShape = {labeledThingInFrame: thirdLabeledThingInFrame};

      mergableShapes = [firstShape, secondShape, thirdShape];

      associatedLabeledThingsInFrame = {rows: []};
    });

    it('sets the LabeledThing of the root shape on all elements', () => {
      service.mergeShapes(mergableShapes);

      expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
    });

    it('stores the ltifs', () => {
      service.mergeShapes(mergableShapes);

      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(firstLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
    });

    it('returns a promise', done => {
      labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
      labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(associatedLabeledThingsInFrame));
      labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());

      service.mergeShapes(mergableShapes).then(done);
      rootScope.$apply();
    });

    it('transfers the classes', () => {
      const classes = ['one', 'two', 'three'];
      secondLabeledThingInFrame.classes = classes;
      const shapes = [secondShape, thirdShape, firstShape];

      service.mergeShapes(shapes);

      expect(firstLabeledThingInFrame.classes).toBe(classes);
      expect(secondLabeledThingInFrame.classes).toBe(classes);
      expect(thirdLabeledThingInFrame.classes).toBe(classes);
    });

    it('updates the frameRange of the LabeledThing', () => {
      service.mergeShapes(mergableShapes);

      const expectedFrameRange = {startFrameIndex: 0, endFrameIndex: 7};
      expect(firstLabeledThing.frameRange).toEqual(expectedFrameRange);
    });

    it('emits shape:delete:after if labeledthings have been deleted', done => {
        spyOn(rootScope, '$emit');

        labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
        labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(associatedLabeledThingsInFrame));
        labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());

        service.mergeShapes(mergableShapes).then(() => {
          expect(rootScope.$emit).toHaveBeenCalledWith('shape:delete:after');
          expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalled();
          done();
        });
        rootScope.$apply();
    });

    it('emits shape:delete:after even if no labeledthings have been removed', done => {
      spyOn(rootScope, '$emit');

      associatedLabeledThingsInFrame = {rows: [1]};

      labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
      labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(associatedLabeledThingsInFrame));
      labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());

      service.mergeShapes(mergableShapes).then(() => {
        expect(rootScope.$emit).toHaveBeenCalledWith('shape:delete:after');
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalled();
        done();
      });
      rootScope.$apply();
    });

    // it('updates the view after merging', done => {
    //   labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
    //   labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(associatedLabeledThingsInFrame));
    //   labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());
    //
    //   view.update.and.callFake(done);
    //
    //   service.mergeShapes(mergableShapes);
    //   expect(view.update).not.toHaveBeenCalled();
    //   rootScope.$apply();
    // });
  });
});