function createPattern(path) {
  return {pattern: path, included: true, served: true, watched: false};
}

function init(files) {
  files.unshift(createPattern(__dirname + '/environment.js'))
}

init.$inject = ['config.files'];

module.exports = {
  'framework:environment': ['factory', init]
};

