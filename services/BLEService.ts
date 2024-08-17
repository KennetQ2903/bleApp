import {PermissionsAndroid, Platform} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

export const requestBluetoothPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (
    Platform.OS === 'android' &&
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  ) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  return false;
};

export async function scanAndConnect(): Promise<BluetoothDevice | null> {
  try {
    const paired = await RNBluetoothClassic.getBondedDevices();
    if (paired.length) {
      const device = paired.find(d => d?.id === '98:D3:31:FD:4B:2A');
      if (device) {
        const connection = await RNBluetoothClassic.isDeviceConnected(
          device.address,
        );
        if (!connection) {
          console.log('connecting....');
          console.log(`Attemping connection with ${device.name}`);
          const bt = await RNBluetoothClassic.connectToDevice(device.address);
          return bt;
        }
        return device;
      }
      return null;
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function writeData(device: BluetoothDevice, data: string) {
  try {
    console.log('Sending data to', device.address, ' Data = ', data);
    const wasSent = await RNBluetoothClassic.writeToDevice(
      device.address,
      data,
      'ascii',
    );
    console.log('THE MESSAGE WAS SENT', wasSent);
  } catch (err) {
    console.log(err);
  }
}
