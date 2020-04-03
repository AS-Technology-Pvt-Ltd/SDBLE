import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {DeviceUUID} from 'device-uuid';

class Demo extends PureComponent {
  constructor() {
    super();
    this.state = {
      bleManager: new BleManager(),
      deviceList: [],
      deviceUUID: DeviceUUID,
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

  calculateDistance = (rssi, txPower) => {
    var txPower = -59; //hard coded power value. Usually ranges between -59 to -65
    // console.log(rssi, txPower);

    if (rssi == 0) {
      return -1.0;
    }

    var ratio = (rssi * 1.0) / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10).toFixed(2);
    } else {
      var distance = 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
      return distance.toFixed(2);
    }

    /*

    1. Reference 

@source :https://forums.estimote.com/t/determine-accurate-distance-of-signal/2858/2

One of the simplest formulas for calculating distance (found it in this paper 2.0k) is:

RSSI = -20 * logd + TxPower (where d = distance)

Which gives you this:

d = 10 ^ ((TxPower - RSSI) / 20)

This will give you very “jumping” results, coming from the nature of RSSI. 
RSSI readings are not very stable and highly depend on environment. 
I’m pretty sure Estimotes uses much mores sophisticated formula that also enables some kind of “smoothing” of data, 
so the readings are more stable. But this will be a good start to get at least some approximation.



2. Reference 

Source :https://www.radiusnetworks.com/2018-11-19-fundamentals-of-beacon-ranging
    */
  };
  scanAndConnect = () => {
    const {bleManager} = this.state;
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        // Handle error (scanning will be stopped automatically)
        return;
      }
      if (device) {
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
      // bleManager.stopDeviceScan();
    });
  };

  uniqueBy = prop => list => {
    const uniques = {};
    return list.reduce((result, item) => {
      if (uniques[item[prop]]) return result;
      uniques[item[prop]] = item;
      return [...result, item];
    }, []);
  };

  render() {
    const {deviceList} = this.state;
    const uniqueById = this.uniqueBy('localName');
    let uDevice = deviceList.length ? uniqueById(deviceList) : [];

    return (
      <View>
        <Text style={styles.heading}>List of Device</Text>
        {uDevice.length
          ? uDevice
              .filter(item => item.localName !== null)
              .map((item, i) => (
                <View key={i}>
                  <Text key={i} style={styles.title}>
                    {i + 1} . {item.localName}
                  </Text>
                  <View style={styles.data}>
                    <Text>UUID:{item.uuid}</Text>
                    <Text>RSSI : {item.rssi}</Text>
                    <Text>
                      TxPowerLevel:{item.txPowerLevel || 'Not Available'}
                    </Text>
                    <Text>
                      Distance(meters):
                      {this.calculateDistance(item.rssi, item.txPowerLevel)}
                    </Text>
                  </View>
                </View>
              ))
          : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    marginVertical: 2,
  },
  data: {
    marginLeft: 10,
  },
  heading: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default Demo;
