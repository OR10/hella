import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearPolyInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearPolyInterpolationEasing';

fdescribe('LinearPolyInterpolationEasing Test Suite', () => {
  /**
   * @type {LinearPolyInterpolationEasing}
   */
  let easing;

  beforeEach(() => {
    easing = new LinearPolyInterpolationEasing();
  });

  it('can be instantiated', () => {
    expect(easing).toEqual(jasmine.any(InterpolationEasing));
  });

  describe('supportsEasing', () => {
    it('returns true if type is linear', () => {
      const actual = easing.supportsEasing('linear');
      expect(actual).toBe(true);
    });

    it('returns false if type is anything else', () => {
      const actual = easing.supportsEasing('something-not-linear');
      expect(actual).toBe(false);
    });
  });

  describe('supportsShape', () => {
    it('returns true if shape is polygon', () => {
      const actual = easing.supportsShape('polygon');
      expect(actual).toBe(true);
    });

    it('returns true if shape is polyline', () => {
      const actual = easing.supportsShape('polyline');
      expect(actual).toBe(true);
    });

    it('returns true if shape is something else', () => {
      const actual = easing.supportsShape('pedestrian');
      expect(actual).toBe(false);
    });
  });

  describe('step()', () => {
    const delta = 0.5;

    it('throws an error if for some reason ghost and and shape have a different amount of points', () => {
      const ghostShape = {
        points: [1]
      };

      const endShape = {
        points: [1, 2]
      };

      const ghost = {type: 'foobar', shapes: [ghostShape]};
      const endLtif = {shapes: [endShape]};

      const throwWrapper = () => {
        easing.step(ghost, null, endLtif, delta);
      }

      expect(throwWrapper).toThrowError('Failed to interpolate foobar with different points.');
    });

    it('calculates the step between the ghost and the end shape', () => {
      const delta = 0.5;

      const ghostShape = {
        points: [
          {x: 1, y: 1},
          {x: 2, y: 2},
          {x: 3, y: 4},
          {x: 8, y: 2},
        ]
      };

      const endShape = {
        points: [
          {x: 2, y: 3},
          {x: 3, y: 1},
          {x: 4, y: 8},
          {x: 1, y: 9},
        ]
      };

      const ghost = {shapes: [ghostShape]};
      const endLtif = {shapes: [endShape]};

      const expectedGhostShapeAfterEasing = {
        points: [
          { x: 1.5, y: 2 },
          { x: 2.5, y: 1.5 },
          { x: 3.5, y: 6 },
          { x: 4.5, y: 5.5 },
        ]
      };

      easing.step(ghost, null, endLtif, delta);

      expect(ghostShape).toEqual(expectedGhostShapeAfterEasing);
    });
  });
});