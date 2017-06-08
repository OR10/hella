import {forEach, isBoolean, isNull, isNumber, isObject, isArray, isString, isUndefined} from 'lodash';

class OuterDocumentVisitor {
  /**
   * @param {InnerDocumentVisitor} innerVisitor
   */
  constructor(innerVisitor) {
    /**
     * @type {InnerDocumentVisitor}
     */
    this._innerVisitor = innerVisitor;

    /**
     * @type {Array.<string>}
     * @private
     */
    this._documentPath = [];
  }

  _pushPath(key = null) {
    if (key === null) {
      this._documentPath.push('<root>');
    } else {
      this._documentPath.push(`${key}`);
    }
  }

  _popPath(key = null) {
    this._documentPath.pop();
  }

  _getPath() {
    return this._documentPath.join('.');
  }

  visit(firstDocument, secondDocument) {
    this._documentPath = [];

    this._innerVisitor.visitDocumentBefore(firstDocument, secondDocument, this._getPath());
    this._visitNode(firstDocument, secondDocument, null);
    return this._innerVisitor.visitDocumentAfter(firstDocument, secondDocument, this._getPath());
  }

  _visitNode(firstNode, secondNode, key = null) {
    switch (true) {
      case this._isScalar(firstNode) && this._isScalar(secondNode):
        return this._visitScalar(firstNode, secondNode, key);
      case isArray(firstNode) && isArray(secondNode):
        return this._visitArray(firstNode, secondNode, key);
      case isObject(firstNode) && isObject(secondNode):
        return this._visitObject(firstNode, secondNode, key);
      default:
        throw new Error(`Can not traverse nodes of type <${typeof firstNode}, ${typeof secondNode}> at location ${this._getPath()}: ${JSON.stringify(firstNode)}, ${JSON.stringify(secondNode)}`);
    }
  }

  _isScalar(candidate) {
    return (
      isString(candidate) ||
      isNumber(candidate) ||
      isBoolean(candidate) ||
      isNull(candidate) ||
      isUndefined(candidate)
    );
  }


  _visitScalar(firstNode, secondNode, key = null) {
    this._pushPath(key);
    this._innerVisitor.visitScalar(firstNode, secondNode, this._getPath());
    this._popPath(key);
  }

  _visitArray(firstNode, secondNode, key = null) {
    this._pushPath(key);
    this._innerVisitor.visitArrayBefore(firstNode, secondNode, this._getPath());
    forEach(firstNode, (childNode, key) => {
      if (!(key in secondNode)) {
        throw new Error(`Array structure is different: Key "[${key}]" at location ${this._getPath()} does not exist in secondNode, but is there in first`);
      }
      this._visitNode(childNode, secondNode[key], `[${key}]`)
    });
    this._innerVisitor.visitArrayAfter(firstNode, secondNode, this._getPath());
    this._popPath(key);
  }

  _visitObject(firstNode, secondNode, key = null) {
    this._pushPath(key);
    this._innerVisitor.visitObjectBefore(firstNode, secondNode, this._getPath());
    forEach(firstNode, (childNode, key) => {
      if (!(key in secondNode)) {
        throw new Error(`Object structure is different: Key "${key}" at location ${this._getPath()} does not exist in secondNode, but is there in first`);
      }
      this._visitNode(childNode, secondNode[key], key)
    });
    this._innerVisitor.visitObjectAfter(firstNode, secondNode, this._getPath());
    this._popPath(key);
  }
}

export default OuterDocumentVisitor