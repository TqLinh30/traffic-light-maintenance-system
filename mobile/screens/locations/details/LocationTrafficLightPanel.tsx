import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { View } from '../../../components/Themed';
import BasicField from '../../../components/BasicField';
import Location from '../../../models/location';
import { TrafficLightPointDetailDTO } from '../../../models/trafficLight';
import api, { getErrorMessage } from '../../../utils/api';

const toReadableLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : '';

const formatDateValue = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : null;

export default function LocationTrafficLightPanel({
  location
}: {
  location: Location;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [details, setDetails] = useState<TrafficLightPointDetailDTO | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setDetails(null);

    api
      .get<TrafficLightPointDetailDTO>(
        `traffic-light-points/location/${location.id}`
      )
      .then((response) => {
        if (isMounted) {
          setDetails(response);
        }
      })
      .catch((error) => {
        const message = getErrorMessage(error);
        if (!/traffic light point not found/i.test(message)) {
          console.warn(
            `Failed to load traffic-light details for location ${location.id}: ${message}`
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.id]);

  const qrValue = useMemo(
    () => details?.activeQrPublicUrl || details?.activeQrPublicCode || '',
    [details?.activeQrPublicCode, details?.activeQrPublicUrl]
  );

  if (!loading && !details) {
    return null;
  }

  return (
    <View>
      <Divider />
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium">{t('traffic_light_qr_code')}</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating
            size="small"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <View>
          <BasicField label={t('pole_code')} value={details?.point?.poleCode} />
          <BasicField
            label={t('current_status')}
            value={toReadableLabel(details?.point?.currentStatus)}
          />
          <BasicField label={t('district')} value={details?.point?.district} />
          <BasicField
            label={t('latest_maintenance')}
            value={formatDateValue(details?.point?.lastMaintenanceAt)}
          />
          <BasicField
            label={t('last_inspection')}
            value={formatDateValue(details?.point?.lastInspectionAt)}
          />
          <BasicField
            label={t('next_maintenance')}
            value={formatDateValue(details?.point?.nextMaintenanceAt)}
          />
          <BasicField
            label={t('maintenance_cycle_days')}
            value={details?.point?.maintenanceCycleDays}
          />
          <BasicField
            label={t('qr_public_code')}
            value={details?.activeQrPublicCode}
          />
          <View style={styles.qrSection}>
            {qrValue ? (
              <View style={styles.qrContent}>
                <View style={styles.qrCard}>
                  <QRCode value={qrValue} size={180} />
                </View>
                <Text selectable style={styles.qrValue}>
                  {details?.activeQrPublicUrl || details?.activeQrPublicCode}
                </Text>
                {!!details?.activeQrPublicUrl && (
                  <Button
                    mode="outlined"
                    onPress={() =>
                      Linking.openURL(details.activeQrPublicUrl as string)
                    }
                  >
                    {t('open_public_qr_page')}
                  </Button>
                )}
              </View>
            ) : (
              <Text>{t('qr_code_not_available')}</Text>
            )}
          </View>
          <Divider />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  qrSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center'
  },
  qrContent: {
    width: '100%',
    alignItems: 'center'
  },
  qrCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  qrValue: {
    textAlign: 'center',
    marginBottom: 16
  }
});
