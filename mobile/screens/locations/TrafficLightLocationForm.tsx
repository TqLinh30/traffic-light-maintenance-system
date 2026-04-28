import React from 'react';
import { Image, Linking, ScrollView, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from '../../components/Themed';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import FileUpload from '../../components/FileUpload';
import { IFile } from '../../models/file';
import { FileMiniDTO } from '../../models/file';
import TrafficLightLocationMapPicker, {
  TrafficLightCoordinates
} from './TrafficLightLocationMapPicker';
import TrafficLightStreetViewPreview from './TrafficLightStreetViewPreview';

export interface TrafficLightLocationFormValues {
  name: string;
  address: string;
  coordinates: TrafficLightCoordinates | null;
  image: FileMiniDTO | IFile[] | null;
  installationDate: Date | null;
  expectedWarrantyDate: Date | null;
  maintenanceHistory: string;
}

interface TrafficLightLocationFormProps {
  initialValues: TrafficLightLocationFormValues;
  submitText: string;
  onSubmit: (values: TrafficLightLocationFormValues) => Promise<any>;
  existingImageUrl?: string | null;
}

const getTranslation = (t, key: string, fallback: string) => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

const getStreetViewUrl = (coordinates: TrafficLightCoordinates | null) => {
  if (!coordinates) {
    return null;
  }

  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates.lat},${coordinates.lng}`;
};

const getMapUrl = (coordinates: TrafficLightCoordinates | null) => {
  if (!coordinates) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
};

const getUploadFilesValue = (
  value: TrafficLightLocationFormValues['image']
): IFile[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

export default function TrafficLightLocationForm({
  initialValues,
  submitText,
  onSubmit,
  existingImageUrl
}: TrafficLightLocationFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
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
  const maintenanceHistoryLabel = getTranslation(
    t,
    'maintenance_history',
    'Repair or maintenance history'
  );
  const streetViewLabel = getTranslation(t, 'street_view', 'Street View');

  return (
    <Formik<TrafficLightLocationFormValues>
      validationSchema={Yup.object().shape({
        name: Yup.string().required(t('required_location_name')),
        address: Yup.string().required(t('required_location_address')),
        coordinates: Yup.object()
          .nullable()
          .required('Please choose a point on the map.')
      })}
      initialValues={initialValues}
      enableReinitialize
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values, { setStatus, setSubmitting }) => {
        setSubmitting(true);
        onSubmit(values).finally(() => {
          setStatus({ success: true });
          setSubmitting(false);
        });
      }}
    >
      {(formik) => {
        const streetViewUrl = getStreetViewUrl(formik.values.coordinates);
        const mapUrl = getMapUrl(formik.values.coordinates);
        const coordinateError =
          typeof formik.errors.coordinates === 'string'
            ? formik.errors.coordinates
            : '';

        return (
          <ScrollView
            style={[
              styles.container,
              { backgroundColor: theme.colors.background }
            ]}
          >
            <View style={styles.formSection}>
              <TextInput
                mode="outlined"
                label={t('name')}
                placeholder={t('enter_location_name')}
                value={formik.values.name}
                onChangeText={(text) => formik.setFieldValue('name', text)}
                error={!!formik.errors.name}
              />
              <HelperText type="error" visible={!!formik.errors.name}>
                {typeof formik.errors.name === 'string'
                  ? formik.errors.name
                  : ''}
              </HelperText>
            </View>

            <View style={styles.formSection}>
              <TextInput
                mode="outlined"
                label={t('address')}
                placeholder="No. 5, Section 1, Zhonghua S Rd, Tainan"
                value={formik.values.address}
                onChangeText={(text) => formik.setFieldValue('address', text)}
                error={!!formik.errors.address}
                multiline
              />
              <HelperText type="error" visible={!!formik.errors.address}>
                {typeof formik.errors.address === 'string'
                  ? formik.errors.address
                  : ''}
              </HelperText>
            </View>

            <View style={styles.formSection}>
              <Text variant="titleMedium">{t('map_coordinates')}</Text>
              <TrafficLightLocationMapPicker
                value={formik.values.coordinates}
                address={formik.values.address}
                onChange={(coordinates) =>
                  formik.setFieldValue('coordinates', coordinates)
                }
                onAddressResolved={(resolvedAddress) =>
                  formik.setFieldValue('address', resolvedAddress)
                }
              />
              <HelperText type="error" visible={!!coordinateError}>
                {coordinateError}
              </HelperText>
            </View>

            <View style={styles.formSection}>
              <Text variant="titleMedium">{streetViewLabel}</Text>
              <Text variant="bodySmall" style={styles.streetViewDescription}>
                {getTranslation(
                  t,
                  'street_view_helper_text',
                  'Street View now opens directly inside the form so you can look around the intersection and confirm the exact pole before saving.'
                )}
              </Text>
              <TrafficLightStreetViewPreview
                coordinates={formik.values.coordinates}
              />
              <View style={styles.streetViewButtons}>
                <Button
                  mode="outlined"
                  disabled={!streetViewUrl}
                  onPress={() => {
                    if (streetViewUrl) {
                      Linking.openURL(streetViewUrl);
                    }
                  }}
                >
                  {getTranslation(t, 'open_street_view', 'Open Street View')}
                </Button>
                <Button
                  mode="outlined"
                  disabled={!mapUrl}
                  onPress={() => {
                    if (mapUrl) {
                      Linking.openURL(mapUrl);
                    }
                  }}
                >
                  {getTranslation(t, 'open_in_maps', 'Open in Google Maps')}
                </Button>
              </View>
            </View>

            <Divider />

            <View style={styles.formSection}>
              {!!existingImageUrl && !Array.isArray(formik.values.image) && (
                <View style={styles.currentImageSection}>
                  <Text variant="titleSmall">
                    {getTranslation(t, 'current_image', 'Current image')}
                  </Text>
                  <Image
                    source={{ uri: existingImageUrl }}
                    style={styles.currentImage}
                  />
                </View>
              )}
              <FileUpload
                title={t('image')}
                type="image"
                multiple={false}
                description={getTranslation(
                  t,
                  'upload_image',
                  'Upload an image'
                )}
                files={getUploadFilesValue(formik.values.image)}
                onChange={(files) => formik.setFieldValue('image', files)}
              />
            </View>

            <View style={styles.formSection}>
              <CustomDateTimePicker
                label={installationDateLabel}
                value={formik.values.installationDate}
                onChange={(date) =>
                  formik.setFieldValue('installationDate', date)
                }
              />
            </View>

            <View style={styles.formSection}>
              <CustomDateTimePicker
                label={expectedWarrantyDateLabel}
                value={formik.values.expectedWarrantyDate}
                onChange={(date) =>
                  formik.setFieldValue('expectedWarrantyDate', date)
                }
              />
            </View>

            <View style={styles.formSection}>
              <TextInput
                mode="outlined"
                label={maintenanceHistoryLabel}
                placeholder={getTranslation(
                  t,
                  'maintenance_history_placeholder',
                  'Optional notes about previous repairs or maintenance.'
                )}
                value={formik.values.maintenanceHistory}
                onChangeText={(text) =>
                  formik.setFieldValue('maintenanceHistory', text)
                }
                multiline
                numberOfLines={5}
              />
            </View>

            <Button
              mode="contained"
              style={styles.submitButton}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              onPress={() => formik.handleSubmit()}
            >
              {submitText}
            </Button>
          </ScrollView>
        );
      }}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12
  },
  formSection: {
    paddingVertical: 12,
    gap: 8
  },
  streetViewDescription: {
    opacity: 0.75
  },
  streetViewButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  currentImageSection: {
    gap: 8
  },
  currentImage: {
    height: 220,
    borderRadius: 12
  },
  submitButton: {
    marginVertical: 24
  }
});
