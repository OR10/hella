import {inject} from 'angular-mocks';
import FrontendInterpolation from 'Application/LabelingData/Interpolations/FrontendInterpolation';

describe('FrontendInterpolation Test Suite', () => {
  it('can be instantiated', () => {
    const interpolation = new FrontendInterpolation();
    expect(interpolation).toEqual(jasmine.any(FrontendInterpolation));
  });

  describe('execute()', () => {
    /**
     * @type {FrontendInterpolation}
     */
    let interpolation;
    let gateway;
    let angularQ;
    let rootScope;
    let frameRange;
    let easingMock;

    beforeEach(inject(($q, $rootScope) => {
      angularQ = $q;
      rootScope = $rootScope;
    }));

    beforeEach(() => {
      gateway = jasmine.createSpyObj('LabeledThingInFrameGateway', ['getLabeledThingInFrame', 'saveLabeledThingInFrame']);
      easingMock = jasmine.createSpyObj('Easing Mock', ['supportsShape', 'supportsEasing', 'step']);
      interpolation = new FrontendInterpolation(gateway, angularQ, easingMock);

      frameRange = {
        startFrameIndex: 1,
        endFrameIndex: 4,
      };
    });

    /*
    it('does not do anything if the labeledThingFrameGateway does not resolve', () => {
      const promise = angularQ.reject();
      gateway.getLabeledThingInFrame.and.returnValue(promise);
      interpolation.execute(null, null, frameRange);
      rootScope.$apply();
    });
    */

    it('throws an error if labeledThingInFramesWithGhosts has length 0', () => {
      const labeledThingInFramesWithGhosts = [];
      const promise = angularQ.resolve(labeledThingInFramesWithGhosts);
      gateway.getLabeledThingInFrame.and.returnValue(promise);

      const throwWrapper = () => {
        interpolation.execute(null, null, frameRange);
        rootScope.$apply();
      };

      expect(throwWrapper).toThrowError('Error in _doInterpolation: Insufficient labeled things in frame');
    });

    it('throws an error if interpolation is done with less than 2 frames', () => {
      const labeledThingInFramesWithGhosts = ['egal'];
      const promise = angularQ.resolve(labeledThingInFramesWithGhosts);
      gateway.getLabeledThingInFrame.and.returnValue(promise);

      const throwWrapper = () => {
        frameRange.endFrameIndex = 1;
        interpolation.execute(null, null, frameRange);
        rootScope.$apply();
      };

      expect(throwWrapper).toThrowError('Error in _doInterpolation: endFrameIndex (1) - startFrameIndex (1) < 2');
    });

    it('throws an error if interpolation is done with only 1 labeledThingInFrame', () => {
      const labeledThingInFramesWithGhosts = [{ghost: false}];
      const promise = angularQ.resolve(labeledThingInFramesWithGhosts);
      gateway.getLabeledThingInFrame.and.returnValue(promise);

      const throwWrapper = () => {
        interpolation.execute(null, null, frameRange);
        rootScope.$apply();
      };

      expect(throwWrapper).toThrowError('Error in _doInterpolation: You need more then 1 real labeledThingInFrames for interpolation');
    });

    describe('actual interpolation', () => {
      let startLtif;
      let endLtif;
      let firstGhost;
      let secondGhost;
      let labeledThingInFramesWithGhosts;
      let promise;

      beforeEach(() => {
        startLtif = {ghost: false, frameIndex: 1, shapes: [{type: 'foobar'}]};
        endLtif = {ghost: false, frameIndex: 4};
        firstGhost = {ghost: true, id: null, ghostBust: jasmine.createSpy('ghostBust')};
        secondGhost = {ghost: true, id: null, ghostBust: jasmine.createSpy('ghostBust')};

        labeledThingInFramesWithGhosts = [
          startLtif,
          firstGhost,
          secondGhost,
          endLtif,
        ];

        promise = angularQ.resolve(labeledThingInFramesWithGhosts);
        gateway.getLabeledThingInFrame.and.returnValue(promise);
        gateway.saveLabeledThingInFrame.and.returnValue(promise);
      });

      it('saves each ghost as new LabeledThingInFrame', () => {
        easingMock.supportsShape.and.returnValue(true);
        easingMock.supportsEasing.and.returnValue(true);

        interpolation.execute(null, null, frameRange);
        rootScope.$apply();

        expect(firstGhost.ghostBust).toHaveBeenCalled();
        expect(secondGhost.ghostBust).toHaveBeenCalled();
        expect(gateway.saveLabeledThingInFrame).toHaveBeenCalledWith(firstGhost);
        expect(gateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondGhost);
        expect(gateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(2);
      });

      it('throws an error if shape is not supported for easing', () => {
        easingMock.supportsShape.and.returnValue(false);
        easingMock.supportsEasing.and.returnValue(true);

        const throwWrapper = () => {
          interpolation.execute(null, null, frameRange);
          rootScope.$apply();
        };

        expect(throwWrapper).toThrowError('There is no easing for foobar with type linear');
      });

      it('throws an error if easing is not supported for type', () => {
        easingMock.supportsShape.and.returnValue(true);
        easingMock.supportsEasing.and.returnValue(false);

        const throwWrapper = () => {
          interpolation.execute(null, null, frameRange);
          rootScope.$apply();
        };

        expect(throwWrapper).toThrowError('There is no easing for foobar with type linear');
      });

      it('throws an error if easing is not supported for type and for the shape', () => {
        easingMock.supportsShape.and.returnValue(false);
        easingMock.supportsEasing.and.returnValue(false);

        const throwWrapper = () => {
          interpolation.execute(null, null, frameRange);
          rootScope.$apply();
        };

        expect(throwWrapper).toThrowError('There is no easing for foobar with type linear');
      });

      it('calls step method of the easing class for every ghost', () => {
        easingMock.supportsShape.and.returnValue(true);
        easingMock.supportsEasing.and.returnValue(true);

        interpolation.execute(null, null, frameRange);
        rootScope.$apply();

        expect(easingMock.step).toHaveBeenCalledWith(firstGhost, startLtif, endLtif, 0.3333333333333333);
        expect(easingMock.step).toHaveBeenCalledWith(secondGhost, startLtif, endLtif, 0.6666666666666666);
        expect(easingMock.step).toHaveBeenCalledTimes(2);
      });
    });
  });
});
