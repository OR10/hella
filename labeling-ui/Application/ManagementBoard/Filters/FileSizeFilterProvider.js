function ReadableRoleFilterProvider() {
  return (bytes, precision = 1) => {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const number = Math.floor(Math.log(bytes) / Math.log(1000));

    if (number === 0) {
      return `${bytes} ${units[number]}`;
    }

    return (bytes / Math.pow(1000, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  };
}

export default ReadableRoleFilterProvider;
