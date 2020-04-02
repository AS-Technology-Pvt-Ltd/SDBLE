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
        console.log(Object.keys(device));

        /*

["serviceUUIDs", "txPowerLevel", "overflowServiceUUIDs", "serviceData", "isConnectable", "id", "localName", "manufacturerData", "rssi", "mtu", "name", "solicitedServiceUUIDs", "_manager"]

        */

        this.setState({
          deviceList: [
            ...this.state.deviceList,
            {
              rssi: device.rssi,
              txPowerLevel: device.txPowerLevel,
              uuid: device.id,
              localName: device.name,
            },
          ],
        });
      }

      //   setTimeout(() => {
      //     bleManager.stopDeviceScan();
      //   }, 2000);
      bleManager.stopDeviceScan();
    });
  }

  render() {
    const {deviceList} = this.state;
    return (
      <View>
        <Text style={{fontSize: 28, textAlign: 'center', marginVertical: 5}}>
          List of Device
        </Text>
        {deviceList.length
          ? deviceList
              .filter(item => item.localName !== null)
              .map((item, i) => (
                <View key={i}>
                  <Text key={i} style={{fontWeight: '600', marginVertical: 2}}>
                    {i + 1} . {item.localName}
                  </Text>
                  <View style={{marginLeft: 10}}>
                    <Text>UUID:{item.uuid}</Text>
                    <Text>RSSI : {item.rssi}</Text>
                    <Text>
                      TxPowerLevel:{item.txPowerLevel || 'Not Available'}
                    </Text>
                  </View>
                </View>
              ))
          : null}
      </View>
    );
  }
}

export default Demo;
