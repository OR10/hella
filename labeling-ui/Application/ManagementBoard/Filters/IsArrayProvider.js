import angular from 'angular';

function IsArrayProvider() {
  return function(input) {
    return angular.isArray(input);
  };
}

export default IsArrayProvider;
