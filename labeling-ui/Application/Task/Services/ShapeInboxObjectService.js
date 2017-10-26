import {clone} from 'lodash';

/**
 * Handling the creation and manipulation of ShapeInboxInformation objects
 *
 * This service should only be used internally, by the ShapeInboxService.
 * It should not be directly used outside of this small context.
 */
class ShapeInboxObjectService {
  /**
   * @param {angular.$q} $q
   * @param {LabelStructureService} labelStructureService
   */
  constructor($q, labelStructureService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {Map.<PaperShape, {shape: PaperThingShape, labelStructureObject: LabelStructureObject}>}
     * @private
     */
    this._objectStorage = new WeakMap();
  }

  /**
   * @param {PaperShape} shape
   * @returns {Promise.<{shape: PaperThingShape, labelStructureObject: LabelStructureObject}>}
   */
  getInboxObject(shape) {
    let promise = this._$q.resolve();

    if (!this._objectStorage.has(shape)) {
      promise = promise
        .then(() => this._generateShapeInformationObject(shape))
        .then(informationObject => this._objectStorage.set(shape, informationObject));
    }

    promise = promise.then(() => this._objectStorage.get(shape));
    return promise;
  }

  /**
   * @param {PaperShape} shape
   * @returns {Promise.<{shape: PaperThingShape, labelStructureObject: LabelStructureObject}>}
   * @private
   */
  _generateShapeInformationObject(shape) {
    const {labeledThingInFrame} = shape;
    const {task} = labeledThingInFrame;

    return this._$q.resolve()
      .then(() => this._labelStructureService.getLabelStructure(task))
      .then(structure => structure.getThingById(labeledThingInFrame.identifierName))
      .then(labelStructureObject => {
        return {
          shape,
          labelStructureObject,
        };
      });
  }

}

ShapeInboxObjectService.$inject = [
  '$q',
  'labelStructureService',
];

export default ShapeInboxObjectService;
