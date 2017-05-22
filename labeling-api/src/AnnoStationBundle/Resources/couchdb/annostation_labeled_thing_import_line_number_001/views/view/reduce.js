function (key, values, rereduce) {
  return Math.max.apply({}, values);
}