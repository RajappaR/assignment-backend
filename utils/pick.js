function pick(objectToPickFrom, propertiesToPick) {
  var pickedObject = {};
  for (var i in objectToPickFrom) {
    if (propertiesToPick.indexOf(i) > -1) {
      pickedObject[i] = objectToPickFrom[i];
    }
  }
  return pickedObject;
}

module.exports = pick;
