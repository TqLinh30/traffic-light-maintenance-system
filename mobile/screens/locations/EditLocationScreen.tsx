import { RootStackScreenProps } from '../../types';
import { View } from '../../components/Themed';
import Form from '../../components/form';
import * as Yup from 'yup';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { getImageAndFiles, handleFileUpload } from '../../utils/overall';
import { useDispatch } from '../../store';
import { editLocation } from '../../slices/location';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { formatLocationValues, getLocationFields } from '../../utils/fields';
import useAuth from '../../hooks/useAuth';
import TrafficLightLocationForm, {
  TrafficLightLocationFormValues
} from './TrafficLightLocationForm';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import api, { getErrorMessage } from '../../utils/api';
import { TrafficLightPointDetailDTO } from '../../models/trafficLight';

export default function EditLocationScreen({
  navigation,
  route
}: RootStackScreenProps<'EditLocation'>) {
  const { t } = useTranslation();
  const { location } = route.params;
  const { getFilteredFields } = useAuth();
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [trafficLightDetails, setTrafficLightDetails] =
    useState<TrafficLightPointDetailDTO | null>(null);
  const [loadingTrafficLightDetails, setLoadingTrafficLightDetails] =
    useState<boolean>(location?.trafficLightEnabled ?? false);
  const shape = {
    name: Yup.string().required(t('required_location_name')),
    address: Yup.string().required(t('required_location_address'))
  };
  const getEditFields = () => {
    const fieldsClone = [...getFilteredFields(getLocationFields(t))];
    return fieldsClone;
  };
  const onEditSuccess = () => {
    showSnackBar(t('changes_saved_success'), 'success');
    navigation.goBack();
  };
  const onEditFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('location_update_failure')), 'error');

  useEffect(() => {
    let isMounted = true;

    if (!location?.trafficLightEnabled) {
      setLoadingTrafficLightDetails(false);
      return;
    }

    setLoadingTrafficLightDetails(true);
    api
      .get<TrafficLightPointDetailDTO>(
        `traffic-light-points/location/${location.id}`
      )
      .then((response) => {
        if (isMounted) {
          setTrafficLightDetails(response);
        }
      })
      .catch((error) => {
        if (isMounted) {
          onEditFailure(error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingTrafficLightDetails(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location?.id, location?.trafficLightEnabled]);

  if (location?.trafficLightEnabled) {
    if (loadingTrafficLightDetails) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating
            size="large"
            color={theme.colors.primary}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TrafficLightLocationForm
          initialValues={{
            name: location?.name ?? '',
            address: location?.address ?? '',
            coordinates:
              location?.longitude !== undefined &&
              location?.longitude !== null &&
              location?.latitude !== undefined &&
              location?.latitude !== null
                ? {
                    lng: location.longitude,
                    lat: location.latitude
                  }
                : null,
            image: location?.image ?? null,
            installationDate: trafficLightDetails?.point?.installationDate
              ? new Date(trafficLightDetails.point.installationDate)
              : null,
            expectedWarrantyDate: trafficLightDetails?.point
              ?.expectedWarrantyDate
              ? new Date(trafficLightDetails.point.expectedWarrantyDate)
              : null,
            maintenanceHistory:
              trafficLightDetails?.point?.maintenanceHistory ?? ''
          }}
          existingImageUrl={
            trafficLightDetails?.point?.locationImageUrl || location?.image?.url
          }
          submitText={t('save')}
          onSubmit={async (values: TrafficLightLocationFormValues) => {
            let image = null;

            try {
              if (Array.isArray(values.image)) {
                if (values.image.length) {
                  const uploadedFiles = await uploadFiles([], values.image);
                  const imageAndFiles = getImageAndFiles(uploadedFiles);
                  image = imageAndFiles.image;
                } else if (location?.image?.id) {
                  image = { id: location.image.id };
                }
              } else if (values.image?.id) {
                image = { id: values.image.id };
              }

              await dispatch(
                editLocation(location.id, {
                  name: values.name.trim(),
                  address: values.address.trim(),
                  latitude: values.coordinates?.lat ?? null,
                  longitude: values.coordinates?.lng ?? null,
                  trafficLightEnabled: true,
                  installationDate: values.installationDate,
                  expectedWarrantyDate: values.expectedWarrantyDate,
                  maintenanceHistory: values.maintenanceHistory?.trim() || null,
                  image,
                  files: []
                })
              );
              onEditSuccess();
            } catch (err) {
              onEditFailure(err);
              throw err;
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Form
        fields={getEditFields()}
        validation={Yup.object().shape(shape)}
        navigation={navigation}
        submitText={t('save')}
        values={{
          ...location,
          trafficLightEnabled: location?.trafficLightEnabled ?? false,
          title: location?.name,
          workers: location?.workers.map((worker) => {
            return {
              label: `${worker.firstName} ${worker.lastName}`,
              value: worker.id
            };
          }),
          teams: location?.teams.map((team) => {
            return {
              label: team.name,
              value: team.id
            };
          }),
          vendors: location?.vendors.map((vendor) => {
            return {
              label: vendor.companyName,
              value: vendor.id
            };
          }),
          customers: location?.customers.map((customer) => {
            return {
              label: customer.name,
              value: customer.id
            };
          }),
          coordinates: location?.longitude
            ? {
                lng: location.longitude,
                lat: location.latitude
              }
            : null
        }}
        onChange={({ field, e }) => {}}
        onSubmit={async (values) => {
          let formattedValues = formatLocationValues(values);
          try {
            const imageAndFiles = await handleFileUpload(
              {
                files: formattedValues.files,
                image: formattedValues.image
              },
              uploadFiles
            );
            formattedValues = {
              ...formattedValues,
              image: imageAndFiles.image,
              files: imageAndFiles.files
            };
            await dispatch(editLocation(location.id, formattedValues));
            onEditSuccess();
          } catch (err) {
            onEditFailure(err);
            throw err;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
