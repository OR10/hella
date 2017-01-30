function(key, values, rereduce) {
  var sumObject = {};
  values.forEach(function(value) {
    Object.keys(value).forEach(function(phase) {
      if (sumObject[phase] === undefined) {
        sumObject[phase] = value[phase]
      } else {
        sumObject[phase] += value[phase]
      }
    });
  });
  return sumObject;
}
