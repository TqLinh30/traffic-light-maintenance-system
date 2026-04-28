import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Image, Linking, StyleSheet, TouchableOpacity } from 'react-native';
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
import Tag from '../../../components/Tag';
import Location from '../../../models/location';
import {
  TrafficLightPointDetailDTO,
  TrafficLightPreventiveMaintenanceSummaryDTO,
  TrafficLightWorkOrderMini
} from '../../../models/trafficLight';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import api, { getErrorMessage } from '../../../utils/api';
import { getStatusColor } from '../../../utils/overall';

const toReadableLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : '';

const getTranslation = (t, key: string, fallback: string) => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

const TrafficLightListRow = ({
  title,
  subtitle,
  statusLabel,
  statusColor,
  onPress
}: {
  title: string;
  subtitle?: string | null;
  statusLabel?: string | null;
  statusColor?: string;
  onPress?: () => void;
}) => {
  const content = (
    <View style={styles.listRow}>
      <View style={styles.listTextContainer}>
        <Text variant="titleSmall">{title}</Text>
        {!!subtitle && (
          <Text variant="bodySmall" style={styles.secondaryText}>
            {subtitle}
          </Text>
        )}
      </View>
      {!!statusLabel && !!statusColor && (
        <Tag text={statusLabel} color="white" backgroundColor={statusColor} />
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

export default function LocationTrafficLightPanel({
  location,
  navigation
}: {
  location: Location;
  navigation: any;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { getFormattedDate } = useContext(CompanySettingsContext);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating
          size="small"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  const point = details?.point;
  const sectionTitleStyle = [
    styles.sectionTitle,
    { color: theme.colors.onBackground }
  ];
  const locationImageUrl = point?.locationImageUrl || location?.image?.url;
  const installationDateLabel = getTranslation(
    t,
    'installation_date',
    'Installation date'
  );
  const expectedWarrantyDateLabel = getTranslation(
    t,
    'expected_warranty_date',
    'Expected warranty date'
  );
  const trafficLightInformationLabel = getTranslation(
    t,
    'traffic_light_information',
    'Traffic light information'
  );
  const maintenanceNotesLabel = getTranslation(
    t,
    'repair_and_maintenance_notes',
    'Repair and maintenance notes'
  );
  const maintenanceHistoryLabel = getTranslation(
    t,
    'repair_and_maintenance_history',
    'Repair and maintenance history'
  );
  const noMaintenanceNotesLabel = getTranslation(
    t,
    'no_repair_or_maintenance_notes_yet',
    'No repair or maintenance notes yet'
  );
  const noMaintenanceHistoryLabel = getTranslation(
    t,
    'no_repair_or_maintenance_history_yet',
    'No repair or maintenance history yet'
  );
  const relatedPmLabel = getTranslation(
    t,
    'related_pm_schedules',
    'Related PM schedules'
  );
  const noRelatedPmLabel = getTranslation(
    t,
    'no_related_pm_schedules',
    'No related PM schedules'
  );

  const renderWorkOrderRow = (workOrder: TrafficLightWorkOrderMini) => {
    const subtitle = [workOrder.customId, getFormattedDate(workOrder.createdAt)]
      .filter(Boolean)
      .join(' | ');

    return (
      <View key={workOrder.id}>
        <TrafficLightListRow
          title={workOrder.title}
          subtitle={subtitle}
          statusLabel={toReadableLabel(workOrder.status)}
          statusColor={getStatusColor(workOrder.status as any, theme)}
          onPress={() => navigation.push('WODetails', { id: workOrder.id })}
        />
        <Divider />
      </View>
    );
  };

  const renderPreventiveMaintenanceRow = (
    preventiveMaintenance: TrafficLightPreventiveMaintenanceSummaryDTO
  ) => {
    const subtitle = [
      preventiveMaintenance.customId,
      preventiveMaintenance.nextWorkOrderDate
        ? `${t('next_maintenance')}: ${getFormattedDate(
            preventiveMaintenance.nextWorkOrderDate
          )}`
        : null
    ]
      .filter(Boolean)
      .join(' | ');

    return (
      <View key={preventiveMaintenance.id}>
        <TrafficLightListRow
          title={preventiveMaintenance.name}
          subtitle={subtitle}
        />
        <Divider />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!!locationImageUrl && (
        <Image source={{ uri: locationImageUrl }} style={styles.heroImage} />
      )}
      <View style={styles.contentSection}>
        <Text variant="titleLarge" style={sectionTitleStyle}>
          {trafficLightInformationLabel}
        </Text>
      </View>
      <BasicField label={t('name')} value={location?.name} />
      <BasicField label={t('address')} value={location?.address} />
      <BasicField label={t('pole_code')} value={point?.poleCode} />
      <BasicField
        label={t('current_status')}
        value={toReadableLabel(point?.currentStatus)}
      />
      <BasicField label={t('district')} value={point?.district} />
      <BasicField
        label={installationDateLabel}
        value={
          point?.installationDate
            ? getFormattedDate(point.installationDate, true)
            : null
        }
      />
      <BasicField
        label={expectedWarrantyDateLabel}
        value={
          point?.expectedWarrantyDate
            ? getFormattedDate(point.expectedWarrantyDate, true)
            : null
        }
      />
      <BasicField
        label={t('latest_maintenance')}
        value={
          point?.lastMaintenanceAt
            ? getFormattedDate(point.lastMaintenanceAt)
            : null
        }
      />
      <BasicField
        label={t('last_inspection')}
        value={
          point?.lastInspectionAt
            ? getFormattedDate(point.lastInspectionAt)
            : null
        }
      />
      <BasicField
        label={t('next_maintenance')}
        value={
          point?.nextMaintenanceAt
            ? getFormattedDate(point.nextMaintenanceAt)
            : null
        }
      />
      <BasicField
        label={t('maintenance_cycle_days')}
        value={point?.maintenanceCycleDays}
      />
      <BasicField
        label={t('qr_public_code')}
        value={details?.activeQrPublicCode}
      />

      <View style={styles.contentSection}>
        <Text variant="titleLarge" style={sectionTitleStyle}>
          {maintenanceNotesLabel}
        </Text>
        <Text variant="bodyMedium" style={styles.notesText}>
          {point?.maintenanceHistory || noMaintenanceNotesLabel}
        </Text>
      </View>
      <Divider />

      <View style={styles.contentSection}>
        <Text variant="titleLarge" style={sectionTitleStyle}>
          {maintenanceHistoryLabel}
        </Text>
      </View>
      {details?.recentWorkOrders?.length ? (
        details.recentWorkOrders.map(renderWorkOrderRow)
      ) : (
        <View style={styles.emptyState}>
          <Text>{noMaintenanceHistoryLabel}</Text>
        </View>
      )}

      <View style={styles.contentSection}>
        <Text variant="titleLarge" style={sectionTitleStyle}>
          {relatedPmLabel}
        </Text>
      </View>
      {details?.preventiveMaintenances?.length ? (
        details.preventiveMaintenances.map(renderPreventiveMaintenanceRow)
      ) : (
        <View style={styles.emptyState}>
          <Text>{noRelatedPmLabel}</Text>
        </View>
      )}

      <View style={styles.contentSection}>
        <Text variant="titleLarge" style={sectionTitleStyle}>
          {t('traffic_light_qr_code')}
        </Text>
      </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  heroImage: {
    width: '100%',
    height: 220
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12
  },
  sectionTitle: {
    fontWeight: '700'
  },
  notesText: {
    lineHeight: 22,
    opacity: 0.8
  },
  listRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  listTextContainer: {
    flex: 1
  },
  secondaryText: {
    opacity: 0.7,
    marginTop: 4
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  qrSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
