import { useTranslation } from 'react-i18next';
import Location from '../../../models/location';
import * as React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { View } from '../../../components/Themed';
import { useTheme } from 'react-native-paper';
import { UserMiniDTO } from '../../../models/user';
import { Customer } from '../../../models/customer';
import { Vendor } from '../../../models/vendor';
import Team from '../../../models/team';
import {
  getCustomerUrl,
  getTeamUrl,
  getUserUrl,
  getVendorUrl
} from '../../../utils/urlPaths';
import ListField from '../../../components/ListField';
import BasicField from '../../../components/BasicField';
import LocationTrafficLightPanel from './LocationTrafficLightPanel';

export default function LocationDetails({
  location,
  navigation
}: {
  location: Location;
  navigation: any;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (location?.trafficLightEnabled) {
    return (
      <ScrollView
        style={{
          ...styles.container,
          backgroundColor: theme.colors.background
        }}
      >
        <LocationTrafficLightPanel
          location={location}
          navigation={navigation}
        />
      </ScrollView>
    );
  }

  const fieldsToRender: {
    label: string;
    value: string | number;
  }[] = [
    { label: t('name'), value: location?.name },
    { label: t('address'), value: location?.address }
  ];
  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      {location.image && (
        <Image style={{ height: 200 }} source={{ uri: location.image.url }} />
      )}
      {fieldsToRender.map((field) => (
        <BasicField key={field.label} label={field.label} value={field.value} />
      ))}
      <ListField
        values={location?.workers}
        label={t('assigned_to')}
        getHref={(user: UserMiniDTO) => getUserUrl(user.id)}
        getValueLabel={(user: UserMiniDTO) =>
          `${user.firstName} ${user.lastName}`
        }
      />
      <ListField
        values={location?.customers}
        label={t('customers')}
        getHref={(customer: Customer) => getCustomerUrl(customer.id)}
        getValueLabel={(customer: Customer) => customer.name}
      />
      <ListField
        values={location?.vendors}
        label={t('vendors')}
        getHref={(vendor: Vendor) => getVendorUrl(vendor.id)}
        getValueLabel={(vendor: Vendor) => vendor.companyName}
      />
      <ListField
        values={location?.teams}
        label={t('teams')}
        getHref={(team: Team) => getTeamUrl(team.id)}
        getValueLabel={(team: Team) => team.name}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
