import {
  Box,
  Divider,
  Grid,
  List,
  ListItemButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { TrafficLightPointDetailDTO } from '../../../models/owns/trafficLight';
import useDateLocale from '../../../hooks/useDateLocale';
import { getScheduleDescription } from '../../../utils/dates';
import {
  getAssetUrl,
  getPreventiveMaintenanceUrl,
  getWorkOrderUrl
} from '../../../utils/urlPaths';

interface TrafficLightPointPanelProps {
  details: TrafficLightPointDetailDTO;
}

const toReadableLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : '';

export default function TrafficLightPointPanel({
  details
}: TrafficLightPointPanelProps) {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { getFormattedDate } = useContext(CompanySettingsContext);

  const SummaryField = ({
    label,
    value
  }: {
    label: string;
    value?: string | number | null;
  }) =>
    value !== null && value !== undefined && value !== '' ? (
      <Grid item xs={12} lg={6}>
        <Typography variant="h6" sx={{ color: theme.colors.alpha.black[70] }}>
          {label}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Grid>
    ) : null;

  const getWorkOrderStatusColor = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return theme.colors.info.main;
      case 'ON_HOLD':
        return theme.colors.warning.main;
      case 'COMPLETE':
        return theme.colors.success.main;
      default:
        return theme.colors.alpha.black[30];
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
          {t('point_details')}
        </Typography>
        <Grid container spacing={2}>
          <SummaryField label={t('pole_code')} value={details.point.poleCode} />
          <SummaryField
            label={t('current_status')}
            value={toReadableLabel(details.point.currentStatus)}
          />
          <SummaryField label={t('district')} value={details.point.district} />
          <SummaryField
            label={t('latest_maintenance')}
            value={
              details.point.lastMaintenanceAt
                ? getFormattedDate(details.point.lastMaintenanceAt)
                : null
            }
          />
          <SummaryField
            label={t('last_inspection')}
            value={
              details.point.lastInspectionAt
                ? getFormattedDate(details.point.lastInspectionAt)
                : null
            }
          />
          <SummaryField
            label={t('next_maintenance')}
            value={
              details.point.nextMaintenanceAt
                ? getFormattedDate(details.point.nextMaintenanceAt)
                : null
            }
          />
          <SummaryField
            label={t('maintenance_cycle_days')}
            value={details.point.maintenanceCycleDays}
          />
          {details.point.mainAsset && (
            <Grid item xs={12} lg={6}>
              <Typography
                variant="h6"
                sx={{ color: theme.colors.alpha.black[70] }}
              >
                {t('asset')}
              </Typography>
              <Typography
                variant="h6"
                sx={{ cursor: 'pointer', color: theme.colors.primary.main }}
                onClick={() => navigate(getAssetUrl(details.point.mainAsset.id))}
              >
                {details.point.mainAsset.name}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
      <Divider />
      <Box>
        <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
          {t('related_pm_schedules')}
        </Typography>
        {details.preventiveMaintenances.length ? (
          <List sx={{ width: '100%' }}>
            {details.preventiveMaintenances.map((preventiveMaintenance) => (
              <ListItemButton
                key={preventiveMaintenance.id}
                divider
                onClick={() =>
                  navigate(getPreventiveMaintenanceUrl(preventiveMaintenance.id))
                }
              >
                <Box>
                  <Typography variant="h6">
                    {preventiveMaintenance.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[
                      preventiveMaintenance.customId,
                      preventiveMaintenance.nextWorkOrderDate
                        ? `${t('next_maintenance')}: ${getFormattedDate(
                            preventiveMaintenance.nextWorkOrderDate
                          )}`
                        : null,
                      preventiveMaintenance.schedule
                        ? getScheduleDescription(
                            preventiveMaintenance.schedule,
                            dateLocale,
                            t
                          )
                        : null
                    ]
                      .filter(Boolean)
                      .join(' | ')}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Stack direction="row" justifyContent="center" width="100%">
            <Typography variant="h5">{t('no_related_pm_schedules')}</Typography>
          </Stack>
        )}
      </Box>
      <Divider />
      <Box>
        <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
          {t('recent_work_orders')}
        </Typography>
        {details.recentWorkOrders.length ? (
          <List sx={{ width: '100%' }}>
            {details.recentWorkOrders.map((workOrder) => (
              <ListItemButton
                key={workOrder.id}
                divider
                onClick={() => navigate(getWorkOrderUrl(workOrder.id))}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{workOrder.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[workOrder.customId, getFormattedDate(workOrder.createdAt)]
                        .filter(Boolean)
                        .join(' | ')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: getWorkOrderStatusColor(workOrder.status),
                      color: 'white',
                      width: 'fit-content',
                      height: 'fit-content',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1
                    }}
                  >
                    {toReadableLabel(workOrder.status)}
                  </Box>
                </Stack>
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Stack direction="row" justifyContent="center" width="100%">
            <Typography variant="h5">{t('no_recent_work_orders')}</Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
