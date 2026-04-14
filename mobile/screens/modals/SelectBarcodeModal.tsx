import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';

import { View } from '../../components/Themed';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { RootStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text } from 'react-native-paper';
import { CameraView } from 'expo-camera';
import { ensureScannerCameraPermission } from '../../utils/mediaPermissions';
import { useIsFocused } from '@react-navigation/native';

export default function SelectBarcodeModal({
  route
}: RootStackScreenProps<'SelectBarcode'>) {
  const { onChange } = route.params;
  const { t } = useTranslation();
  const [scanned, setScanned] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const layout = useWindowDimensions();
  const isFocused = useIsFocused();

  useEffect(() => {
    let mounted = true;

    if (!isFocused) {
      return () => {
        mounted = false;
      };
    }

    const requestPermission = async () => {
      setScanned(false);
      setHasPermission(null);
      console.warn(
        '[SelectBarcodeModal] Tap/screen open -> request camera permission'
      );
      const granted = await ensureScannerCameraPermission('SelectBarcodeModal');
      if (mounted) {
        setHasPermission(granted);
      }
    };

    requestPermission();

    return () => {
      mounted = false;
    };
  }, [isFocused]);

  const handleBarCodeScanned = ({
    type,
    data
  }: {
    type: string;
    data: string;
  }) => {
    if (!scanned) {
      console.warn(
        '[SelectBarcodeModal] Barcode scanned',
        JSON.stringify({ type })
      );
      setScanned(true);
      onChange(data);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size={'large'} />
        <Text variant={'titleLarge'} style={styles.permissionText}>
          {t('to_scan')}
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text variant={'titleLarge'}>{t('no_access_to_camera')}</Text>
        <TouchableOpacity
          onPress={async () => {
            console.warn('[SelectBarcodeModal] Retry permission');
            const granted = await ensureScannerCameraPermission(
              'SelectBarcodeModal'
            );
            setHasPermission(granted);
          }}
          style={styles.permissionButton}
        >
          <Text variant="titleMedium">{t('camera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          style={styles.permissionButton}
        >
          <Text variant="titleMedium">{t('open_settings')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          key={'barcode-camera'}
          active={isFocused}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onCameraReady={() => {
            console.warn('[SelectBarcodeModal] Camera ready');
          }}
          onMountError={(event) => {
            console.warn(
              '[SelectBarcodeModal] Camera mount error',
              JSON.stringify(event)
            );
          }}
          style={{ width: layout.width, height: layout.height }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  permissionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center'
  },
  permissionText: {
    marginTop: 16
  },
  permissionButton: {
    alignSelf: 'flex-start',
    marginTop: 16
  }
});
