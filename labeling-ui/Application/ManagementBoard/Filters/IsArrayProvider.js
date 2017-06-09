import angular from 'angular';

function IsArrayProvider() {
  return input => angular.isArray(input);
}

export default IsArrayProvider;
