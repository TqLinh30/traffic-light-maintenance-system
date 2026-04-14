import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItemButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PrintIcon from '@mui/icons-material/Print';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
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
  const [copied, setCopied] = useState(false);
  const qrPublicUrl = details.activeQrPublicCode
    ? `${window.location.origin}/traffic-light/${details.activeQrPublicCode}`
    : '';

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

  const handleCopyQrLink = async () => {
    if (!qrPublicUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(qrPublicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy traffic light QR link', error);
    }
  };

  const handleDownloadQR = () => {
    if (!details.activeQrPublicCode) {
      return;
    }
    const svg = document.getElementById(
      `traffic-light-qr-code-${details.point.id}`
    );
    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${
        details.point.poleCode || 'traffic-light'
      }-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintQR = () => {
    if (!details.activeQrPublicCode) {
      return;
    }
    const svg = document.getElementById(
      `traffic-light-qr-code-${details.point.id}`
    );
    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>QR Code - ${details.point.poleCode}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <img src="data:image/svg+xml;base64,${btoa(svgData)}" />
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.focus();
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 500);
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
          <SummaryField
            label={t('qr_public_code')}
            value={details.activeQrPublicCode}
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
                onClick={() =>
                  navigate(getAssetUrl(details.point.mainAsset.id))
                }
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
          {t('traffic_light_qr_code')}
        </Typography>
        {qrPublicUrl ? (
          <Stack spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box
              sx={{
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                p: 3,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                <QRCodeSVG
                  id={`traffic-light-qr-code-${details.point.id}`}
                  value={qrPublicUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {qrPublicUrl}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              width="100%"
              justifyContent={{ sm: 'center' }}
            >
              <Button variant="outlined" onClick={handleCopyQrLink}>
                {copied ? t('copied') : t('copy')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(qrPublicUrl, '_blank')}
              >
                {t('OPEN')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadQR}
              >
                {t('download')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintQR}
              >
                {t('print')}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="center" width="100%">
            <Typography variant="h5">{t('qr_code_not_available')}</Typography>
          </Stack>
        )}
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
                  navigate(
                    getPreventiveMaintenanceUrl(preventiveMaintenance.id)
                  )
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
                      {[
                        workOrder.customId,
                        getFormattedDate(workOrder.createdAt)
                      ]
                        .filter(Boolean)
                        .join(' | ')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: getWorkOrderStatusColor(
                        workOrder.status
                      ),
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
