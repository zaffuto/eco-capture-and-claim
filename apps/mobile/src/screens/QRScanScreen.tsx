import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';
import { supabase } from '@eco/database';
import { RecyclingRecord } from '@eco/shared';

export const QRScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && locationStatus === 'granted'
      );
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    try {
      setScanned(true);
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Create recycling record
      const { data: record, error } = await supabase
        .from('recycling_records')
        .insert({
          container_id: data,
          location: `(${location.coords.latitude},${location.coords.longitude})`,
          battery_type: 'default', // This should come from QR data
        })
        .select()
        .single();

      if (error) throw error;

      // Show success message
      alert('¡Contenedor registrado con éxito!');
    } catch (error) {
      console.error('Error al escanear:', error);
      alert('Error al registrar el contenedor. Por favor intenta de nuevo.');
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permisos de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <View style={styles.scanner} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
      </Camera>
      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Escanear otro</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  focusedContainer: {
    flex: 2,
    alignItems: 'center',
  },
  scanner: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    left: '25%',
    right: '25%',
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
