import { RootStackScreenProps } from '../../types';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { useDispatch } from '../../store';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { getImageAndFiles } from '../../utils/overall';
import { addLocation, getLocationChildren } from '../../slices/location';
import { getErrorMessage } from '../../utils/api';
import TrafficLightLocationForm, {
  TrafficLightLocationFormValues
} from './TrafficLightLocationForm';
import { View } from '../../components/Themed';

export default function CreateLocationScreen({
  navigation,
  route
}: RootStackScreenProps<'AddLocation'>) {
  const { t } = useTranslation();
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const onCreationSuccess = () => {
    showSnackBar(t('location_create_success'), 'success');
    navigation.goBack();
  };
  const onCreationFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('location_create_failure')), 'error');

  return (
    <View style={styles.container}>
      <TrafficLightLocationForm
        initialValues={{
          name: '',
          address: '',
          coordinates: null,
          image: null,
          installationDate: null,
          expectedWarrantyDate: null,
          maintenanceHistory: ''
        }}
        submitText={t('create_location')}
        onSubmit={async (values: TrafficLightLocationFormValues) => {
          let formattedValues = {
            name: values.name.trim(),
            address: values.address.trim(),
            latitude: values.coordinates?.lat ?? null,
            longitude: values.coordinates?.lng ?? null,
            trafficLightEnabled: true,
            installationDate: values.installationDate,
            expectedWarrantyDate: values.expectedWarrantyDate,
            maintenanceHistory: values.maintenanceHistory?.trim() || null,
            image: null,
            files: []
          };

          try {
            const uploadedFiles = await uploadFiles(
              [],
              Array.isArray(values.image) ? values.image : []
            );
            const imageAndFiles = getImageAndFiles(uploadedFiles);
            formattedValues = {
              ...formattedValues,
              image: imageAndFiles.image,
              files: imageAndFiles.files ?? []
            };
            await dispatch(addLocation(formattedValues));
            onCreationSuccess();
            dispatch(getLocationChildren(0, []));
          } catch (err) {
            onCreationFailure(err);
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
  }
});
