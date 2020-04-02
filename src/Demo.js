import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

class Demo extends PureComponent {
  constructor() {
    super();
    this.state = {
      bleManager: new BleManager(),
      deviceList: [],
    };
  }

  componentDidMount() {
    const {bleManager} = this.state;
    let subscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  }
  scanAndConnect() {
    const {bleManager} = this.state;
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        // Handle error (scanning will be stopped automatically)
        return;
      }
      if (device) {
        this.setState({deviceList: [...this.state.deviceList, device.name]});
      }

      // bleManager.stopDeviceScan();
    });
  }

  render() {
    const {deviceList} = this.state;
    let mDeviceList = deviceList.length
      ? [...new Set(deviceList.filter(item => item !== null))]
      : [];
    return (
      <View>
        <Text style={{fontSize: 28, textAlign: 'center', marginVertical: 5}}>
          List of Device
        </Text>
        {mDeviceList.length
          ? mDeviceList
              .filter(item => item !== null)
              .map((item, i) => (
                <Text key={i} style={{fontWeight: '400', marginVertical: 2}}>
                  {i + 1} . {item}
                </Text>
              ))
          : null}
      </View>
    );
  }
}

export default Demo;
