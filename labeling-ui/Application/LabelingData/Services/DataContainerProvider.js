import DataContainer from '../Support/DataContainer';

class DataContainerProvider {
  $get() {
    return new DataContainer();
  }
}

export default DataContainerProvider;
