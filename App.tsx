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
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import LottieView from 'lottie-react-native';
import {BluetoothDevice} from 'react-native-bluetooth-classic';
import Auth from 'react-native-touch-id';
import AntIcon from 'react-native-vector-icons/AntDesign';
import FeatherIcon from 'react-native-vector-icons/Feather';
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
  const [isScanning, setIsScanning] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice>();
  const [isLocked, setIsLocked] = useState(true);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isErrorAuth, setIsErrorAuth] = useState(false);

  const handleBLEPermissions = useCallback(async () => {
    const result = await requestBluetoothPermission();
    setBleAvailable(result);
  }, []);

  useEffect(() => {
    async function setup() {
      await handleBLEPermissions();
    }
    setup();
  }, [handleBLEPermissions]);

  const handleScan = useCallback(async () => {
    if (bleAvailable) {
      setIsScanning(true);
      const d = await scanAndConnect();
      setTimeout(() => setIsScanning(false), 2000);
      if (d) {
        setDevice(d);
        ToastAndroid.show('Cerradura encontrada!', ToastAndroid.BOTTOM);
      } else {
        ToastAndroid.show('No hay cerraduras disponibles', ToastAndroid.BOTTOM);
      }
    }
  }, [bleAvailable]);

  const handleSendData = useCallback(async () => {
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
            await writeData(device, isLocked ? '1' : '0');
            setIsLocked(prev => !prev);
            setAuthSuccess(true);
          }
        })
        .catch((error: unknown) => {
          console.log('Not Authenticated!', error);
          setIsErrorAuth(true);
        });
    }
  }, [device, isLocked]);

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text>Cerradura: {device?.address ?? 'No Disponible'}</Text>
      <View style={styles.buttonContainer}>
        {authSuccess && (
          <LottieView
            source={require('./animations/granted.json')}
            style={styles.animationContainer}
            resizeMode="contain"
            autoPlay
            loop={false}
            onAnimationFinish={() => {
              setAuthSuccess(false);
            }}
          />
        )}
        {isErrorAuth && (
          <LottieView
            source={require('./animations/denied.json')}
            style={styles.animationContainer}
            resizeMode="contain"
            autoPlay
            loop={false}
            onAnimationFinish={() => {
              console.log('animation finished');
              setIsErrorAuth(false);
            }}
          />
        )}
        {isScanning && (
          <LottieView
            source={require('./animations/scanning.json')}
            style={styles.animationContainer}
            resizeMode="contain"
            autoPlay
          />
        )}
        {device && !isErrorAuth && !authSuccess && !isScanning && (
          <TouchableOpacity onPress={handleSendData} style={styles.lockButton}>
            <FeatherIcon
              name={isLocked ? 'unlock' : 'lock'}
              size={96}
              color={Colors.darker}
            />
            <Text style={styles.buttonText}>
              {isLocked ? 'Desbloquear' : 'Bloquear'}
            </Text>
          </TouchableOpacity>
        )}
        {!isScanning && !device && (
          <TouchableOpacity onPress={handleScan} style={styles.lockButton}>
            <AntIcon name="disconnect" size={96} color={Colors.darker} />
            <Text style={styles.buttonText}>Conectar Cerradura</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  lockButton: {
    backgroundColor: 'white',
    height: 280,
    width: 280,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 280,
    gap: 5,
  },
  animationContainer: {
    width: 280,
    height: '100%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
