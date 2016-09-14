function ReadableTimespanFilterProvider() {
  return function readableTimespan(timespanInSeconds) {
    const hours = parseInt( timespanInSeconds / 3600 ) % 24;
    const minutes = parseInt(timespanInSeconds / 60) % 60;
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };
}

export default ReadableTimespanFilterProvider;
