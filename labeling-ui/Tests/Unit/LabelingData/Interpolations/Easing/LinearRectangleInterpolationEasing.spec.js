import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearRectangleInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearRectangleInterpolationEasing';

describe('LinearRectangleInterpolationEasing Test Suite', () => {
  /**
   * @type {LinearRectangleInterpolationEasing}
   */
  let easing;

  beforeEach(() => {
    easing = new LinearRectangleInterpolationEasing();
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
    it('returns true if shape is rectangle', () => {
      const actual = easing.supportsShape('rectangle');
      expect(actual).toBe(true);
    });

    it('returns true if shape is something else', () => {
      const actual = easing.supportsShape('pedestrian');
      expect(actual).toBe(false);
    });
  });

  describe('step()', () => {
    it('calculates the step between the ghost and the end shape', () => {
      const delta = 0.3;

      const ghostShape = {
        topLeft: {x: 1, y: 8},
        bottomRight: {x: 8, y: 1},
      };

      const endShape = {
        topLeft: {x: 10, y: 100},
        bottomRight: {x: 88, y: 80},
      };

      const ghost = {shapes: [ghostShape]};
      const endLtif = {shapes: [endShape]};

      const expectedGhostShapeAfterEasing = {
        topLeft: { x: 3.6999999999999997, y: 35.599999999999994 },
        bottomRight: { x: 32, y: 24.7 },
      };

      easing.step(ghost, null, endLtif, delta);

      expect(ghostShape).toEqual(expectedGhostShapeAfterEasing);
    });
  });
});
