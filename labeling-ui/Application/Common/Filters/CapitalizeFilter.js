function CapitalizeFilter() {
  return input => {
    let returnValue = input;
    if (input !== null) {
      returnValue = input.toLowerCase();
    }
    return returnValue.substring(0, 1).toUpperCase() + returnValue.substring(1);
  };
}

export default CapitalizeFilter;
