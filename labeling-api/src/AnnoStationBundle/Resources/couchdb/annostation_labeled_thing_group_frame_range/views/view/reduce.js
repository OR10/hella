function (key, values, rereduce) {
  var min = Infinity
  for(var i = 0; i < values.length; i++)
    if(typeof values[i][0] == 'number')
      min = Math.min(values[i][0], min)

  var max = -Infinity
  for(var i = 0; i < values.length; i++)
    if(typeof values[i][1] == 'number')
      max = Math.max(values[i][1], max)

  return [min, max]
}