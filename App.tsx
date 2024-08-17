/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import {BluetoothDevice} from 'react-native-bluetooth-classic';
import Auth from 'react-native-touch-id';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  requestBluetoothPermission,
  scanAndConnect,
  writeData,
} from './services/BLEService';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [bleAvailable, setBleAvailable] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice>();

  useEffect(() => {
    async function setup() {
      const result = await requestBluetoothPermission();
      setBleAvailable(result);
    }
    setup();
  }, []);

  useEffect(() => {
    if (bleAvailable) {
      const getDevices = async () => {
        const d = await scanAndConnect();
        if (d) {
          setDevice(d);
        }
      };
      getDevices();
    }
  }, [bleAvailable]);

  const handleSendData = useCallback(
    async (data: string) => {
      if (device) {
        Auth.authenticate('Desbloquear cerradura', {
          title: 'Autenticación',
          imageColor: '#000',
          cancelText: 'Cancelar',
          sensorDescription: 'Toca el sensor',
          sensorErrorDescription: 'Error',
          imageErrorColor: '#ff0000',
        })
          .then(async (success: boolean) => {
            if (success) {
              await writeData(device, data);
            }
          })
          .catch((error: unknown) => {
            console.log('Not Authenticated!', error);
          });
      }
    },
    [device],
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text>Device: {device?.address}</Text>
      <TouchableOpacity
        onPress={() => handleSendData('0')}
        style={{backgroundColor: 'white', marginVertical: 20, height: 50}}>
        <Text style={{color: 'black'}}>Send Data 0</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSendData('1')}
        style={{backgroundColor: 'white', marginVertical: 20, height: 50}}>
        <Text style={{color: 'black'}}>Send Data 1</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default App;
