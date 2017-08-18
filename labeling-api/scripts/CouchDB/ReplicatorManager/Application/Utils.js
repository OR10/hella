const md5 = require('md5');

/**
 *
 * @param {string} source
 * @param {string} target
 * @returns {string}
 */
function getReplicationDocumentIdName(source, target) {
  return `replication-manager-${md5(source + target)}`;
}

exports.getReplicationDocumentIdName = getReplicationDocumentIdName;
