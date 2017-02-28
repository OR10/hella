function FileSizeFilterProvider() {
  return (bytes, precision = 1, zeroBytesString = '0 bytes') => {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (bytes === 0) {
      return zeroBytesString;
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const number = Math.floor(Math.log(bytes) / Math.log(1000));

    if (number === 0) {
      return `${bytes} ${units[number]}`;
    }

    return (bytes / Math.pow(1000, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  };
}

export default FileSizeFilterProvider;
