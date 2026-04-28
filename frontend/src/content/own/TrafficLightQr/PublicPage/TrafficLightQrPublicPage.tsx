import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import TrafficOutlinedIcon from '@mui/icons-material/TrafficOutlined';
import i18n from 'i18next';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supportedLanguages, switchAppLanguage } from 'src/i18n/i18n';
import Request from 'src/models/owns/request';
import {
  TrafficLightPointPublicDTO,
  TrafficLightQrRequestCreateDTO,
  TrafficLightQrResolveDTO,
  TrafficLightQrSuccessState,
  TrafficLightSafetySeverity,
  TrafficLightStatus,
  TrafficLightWorkOrderMini
} from 'src/models/owns/trafficLight';
import api, { getErrorMessage } from 'src/utils/api';

type PageMode = 'landing' | 'form' | 'success';
type ScanLocationStatus = 'idle' | 'capturing' | 'captured' | 'unavailable';

type FormValues = {
  title: string;
  description: string;
  contact: string;
  faultType: string;
  safetySeverity: TrafficLightSafetySeverity;
  scanLatitude: number | null;
  scanLongitude: number | null;
};

const faultTypeOptions = [
  { value: 'SIGNAL_OUT', label: 'Signal outage' },
  { value: 'LAMP_OUT', label: 'Lamp outage' },
  { value: 'FLASHING', label: 'Flashing signal' },
  { value: 'CONTROLLER', label: 'Controller issue' },
  { value: 'TIMING', label: 'Timing issue' },
  { value: 'POLE_DAMAGE', label: 'Pole damage' },
  { value: 'OTHER', label: 'Other' }
];

const safetySeverityOptions: TrafficLightSafetySeverity[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
];

const getSuccessStorageKey = (qrPublicCode: string) =>
  `traffic-light-qr-success:${qrPublicCode}`;

const toReadableLabel = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium'
  }).format(date);
};

const getStatusChipStyles = (status: TrafficLightStatus, theme: Theme) => {
  switch (status) {
    case 'HEALTHY':
      return {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark
      };
    case 'MAINTENANCE_DUE_SOON':
      return {
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.dark
      };
    case 'MAINTENANCE_OVERDUE':
    case 'NEEDS_REPAIR':
      return {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.dark
      };
    case 'IN_PROGRESS':
      return {
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.dark
      };
    case 'INACTIVE':
      return {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.text.primary
      };
  }
};

const mapResolveErrorMessage = (
  message: string,
  t: (key: string) => string
) => {
  if (message === 'QR tag not found') {
    return t('qr_code_not_found');
  }

  if (message === 'QR tag is not active') {
    return t('qr_code_disabled');
  }

  return message;
};

const DetailField = ({
  label,
  value
}: {
  label: string;
  value?: string | number | null;
}) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      p: 2,
      height: '100%'
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600 }}>
      {value || '-'}
    </Typography>
  </Paper>
);

const WorkOrderSummary = ({
  workOrder
}: {
  workOrder: TrafficLightWorkOrderMini;
}) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      p: 2
    }}
  >
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {workOrder.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {workOrder.customId || `#${workOrder.id}`}
          </Typography>
        </Box>
        <Chip label={toReadableLabel(workOrder.status)} size="small" />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Due: {formatDateTime(workOrder.dueDate)}
      </Typography>
    </Stack>
  </Paper>
);

export default function TrafficLightQrPublicPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { qrPublicCode } = useParams<{ qrPublicCode: string }>();
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const pageMode = useMemo<PageMode>(() => {
    if (routeLocation.pathname.endsWith('/report')) {
      return 'form';
    }
    if (routeLocation.pathname.endsWith('/success')) {
      return 'success';
    }
    return 'landing';
  }, [routeLocation.pathname]);

  const [context, setContext] = useState<TrafficLightQrResolveDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [scanLocationStatus, setScanLocationStatus] =
    useState<ScanLocationStatus>('idle');
  const [formValues, setFormValues] = useState<FormValues>({
    title: '',
    description: '',
    contact: '',
    faultType: 'OTHER',
    safetySeverity: 'MEDIUM',
    scanLatitude: null,
    scanLongitude: null
  });

  const successState = useMemo<TrafficLightQrSuccessState | null>(() => {
    const routeState = routeLocation.state as TrafficLightQrSuccessState | null;
    if (routeState?.requestId || routeState?.requestTitle) {
      return routeState;
    }

    if (!qrPublicCode || pageMode !== 'success') {
      return null;
    }

    try {
      const storedValue = sessionStorage.getItem(
        getSuccessStorageKey(qrPublicCode)
      );
      return storedValue
        ? (JSON.parse(storedValue) as TrafficLightQrSuccessState)
        : null;
    } catch {
      return null;
    }
  }, [pageMode, qrPublicCode, routeLocation.state]);

  const loadContext = useCallback(async () => {
    if (!qrPublicCode) {
      setLoading(false);
      setLoadingError(t('qr_code_not_found'));
      return;
    }

    setLoading(true);
    setLoadingError(null);
    try {
      const response = await api.get<TrafficLightQrResolveDTO>(
        `traffic-light-qr/${qrPublicCode}`
      );
      setContext(response);
    } catch (error) {
      const message = getErrorMessage(error, t('request_submit_failure'));
      setLoadingError(mapResolveErrorMessage(message, t));
    } finally {
      setLoading(false);
    }
  }, [qrPublicCode, t]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (pageMode !== 'form') {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setScanLocationStatus('unavailable');
      return;
    }

    setScanLocationStatus('capturing');
    let isCancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isCancelled) {
          return;
        }

        setFormValues((current) => ({
          ...current,
          scanLatitude: position.coords.latitude,
          scanLongitude: position.coords.longitude
        }));
        setScanLocationStatus('captured');
      },
      () => {
        if (!isCancelled) {
          setScanLocationStatus('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [pageMode]);

  const point = context?.point;
  const activeWorkOrders = context?.activeWorkOrders || [];
  const successStorageKey = qrPublicCode
    ? getSuccessStorageKey(qrPublicCode)
    : '';

  const handleFieldChange = useCallback(
    (field: keyof FormValues, value: string | number | null) => {
      setFormValues((current) => ({
        ...current,
        [field]: value
      }));
      setFormErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    },
    []
  );

  const validateForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!formValues.title.trim()) {
      nextErrors.title = t('required_title');
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formValues.title, t]);

  const handleSubmit = useCallback(async () => {
    if (!qrPublicCode || !validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: TrafficLightQrRequestCreateDTO = {
        title: formValues.title.trim(),
        description: formValues.description.trim() || null,
        contact: formValues.contact.trim() || null,
        faultType: formValues.faultType || null,
        safetySeverity: formValues.safetySeverity || null,
        scanTimestamp: new Date().toISOString(),
        scanLatitude: formValues.scanLatitude,
        scanLongitude: formValues.scanLongitude
      };

      const request = await api.post<Request>(
        `traffic-light-qr/${qrPublicCode}/requests`,
        payload
      );

      const nextSuccessState: TrafficLightQrSuccessState = {
        requestId: request.id,
        requestTitle: request.title,
        submittedAt: new Date().toISOString()
      };

      sessionStorage.setItem(
        successStorageKey,
        JSON.stringify(nextSuccessState)
      );

      navigate(`/traffic-light/${qrPublicCode}/success`, {
        replace: true,
        state: nextSuccessState
      });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, t('request_submit_failure')), {
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    enqueueSnackbar,
    formValues,
    navigate,
    qrPublicCode,
    successStorageKey,
    t,
    validateForm
  ]);

  const handleViewPointDetails = useCallback(() => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const pageTitle = useMemo(() => {
    if (pageMode === 'form') {
      return `${t('report_issue')} - ${point?.poleCode || qrPublicCode || ''}`;
    }

    if (pageMode === 'success') {
      return t('request_submitted_success');
    }

    return `${point?.poleCode || qrPublicCode || ''} - ${t(
      'traffic_light_point'
    )}`;
  }, [pageMode, point?.poleCode, qrPublicCode, t]);

  const summaryContent = (currentPoint: TrafficLightPointPublicDTO) => (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3
      }}
    >
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={currentPoint.locationImageUrl ? 7 : 12}>
          <Stack spacing={2.5} sx={{ height: '100%' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TrafficOutlinedIcon color="primary" />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {currentPoint.name}
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  {currentPoint.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('pole_code')}: {currentPoint.poleCode}
                </Typography>
              </Stack>

              <Chip
                label={toReadableLabel(currentPoint.currentStatus)}
                sx={getStatusChipStyles(currentPoint.currentStatus, theme)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {pageMode !== 'form' && (
                <Button
                  variant="contained"
                  startIcon={<ReportProblemOutlinedIcon />}
                  onClick={() =>
                    navigate(`/traffic-light/${qrPublicCode}/report`)
                  }
                >
                  {t('report_issue')}
                </Button>
              )}
              {pageMode === 'landing' && (
                <Button variant="outlined" onClick={handleViewPointDetails}>
                  {t('view_point_details')}
                </Button>
              )}
              {pageMode !== 'landing' && (
                <Button
                  variant="text"
                  startIcon={<ArrowBackOutlinedIcon />}
                  onClick={() => navigate(`/traffic-light/${qrPublicCode}`)}
                >
                  {t('back_to_point')}
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>
        {currentPoint.locationImageUrl && (
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={currentPoint.locationImageUrl}
              alt={currentPoint.name}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: 240,
                maxHeight: 320,
                objectFit: 'cover',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider'
              }}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!point || loadingError) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'background.default'
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Alert severity="error">
                {loadingError || t('qr_code_not_found')}
              </Alert>
              <Button variant="contained" onClick={() => void loadContext()}>
                Retry
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar
          sx={{
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              px: '0 !important',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PlaceOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('traffic_light_service')}
              </Typography>
            </Stack>

            <TextField
              select
              size="small"
              value={i18n.language}
              onChange={(event) => {
                void switchAppLanguage(event.target.value);
              }}
              sx={{ minWidth: 140 }}
            >
              {supportedLanguages.map((supportedLanguage) => (
                <MenuItem
                  key={supportedLanguage.code}
                  value={supportedLanguage.code}
                >
                  {supportedLanguage.label}
                </MenuItem>
              ))}
            </TextField>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          {summaryContent(point)}

          {pageMode === 'landing' && (
            <>
              <Grid container spacing={2} ref={detailsRef}>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label="Installation date"
                    value={formatDate(point.installationDate)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label="Expected warranty date"
                    value={formatDate(point.expectedWarrantyDate)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label={t('latest_maintenance')}
                    value={formatDateTime(point.lastMaintenanceAt)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label={t('next_maintenance')}
                    value={formatDateTime(point.nextMaintenanceAt)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label="Last inspection"
                    value={formatDateTime(point.lastInspectionAt)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label={t('maintenance_cycle_days')}
                    value={
                      point.maintenanceCycleDays
                        ? `${point.maintenanceCycleDays}`
                        : '-'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label={t('asset')}
                    value={
                      point.mainAsset
                        ? `${point.mainAsset.name}${
                            point.mainAsset.customId
                              ? ` (${point.mainAsset.customId})`
                              : ''
                          }`
                        : '-'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField label="District" value={point.district} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField label="Ward" value={point.ward} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField label="Road" value={point.roadName} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailField
                    label="Intersection"
                    value={point.intersectionName}
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Repair and maintenance notes
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {point.maintenanceHistory ||
                      'No repair or maintenance notes yet'}
                  </Typography>
                </Stack>
              </Paper>

              {activeWorkOrders.length > 0 && (
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <BuildOutlinedIcon color="primary" />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {t('active_work_orders')}
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      {activeWorkOrders.map((workOrder) => (
                        <Grid item xs={12} md={6} key={workOrder.id}>
                          <WorkOrderSummary workOrder={workOrder} />
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>
              )}
            </>
          )}

          {pageMode === 'form' && (
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {t('report_issue')}
                </Typography>

                {scanLocationStatus === 'capturing' && (
                  <Alert severity="info">{t('capturing_location')}</Alert>
                )}
                {scanLocationStatus === 'captured' && (
                  <Alert severity="success">{t('location_captured')}</Alert>
                )}
                {scanLocationStatus === 'unavailable' && (
                  <Alert severity="warning">{t('location_unavailable')}</Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('title')}
                      value={formValues.title}
                      onChange={(event) =>
                        handleFieldChange('title', event.target.value)
                      }
                      error={Boolean(formErrors.title)}
                      helperText={formErrors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label={t('description')}
                      value={formValues.description}
                      onChange={(event) =>
                        handleFieldChange('description', event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('contact')}
                      value={formValues.contact}
                      onChange={(event) =>
                        handleFieldChange('contact', event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label={t('fault_type')}
                      value={formValues.faultType}
                      onChange={(event) =>
                        handleFieldChange('faultType', event.target.value)
                      }
                    >
                      {faultTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label={t('safety_severity')}
                      value={formValues.safetySeverity}
                      onChange={(event) =>
                        handleFieldChange(
                          'safetySeverity',
                          event.target.value as TrafficLightSafetySeverity
                        )
                      }
                    >
                      {safetySeverityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {toReadableLabel(option)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => void handleSubmit()}
                    disabled={submitting}
                  >
                    {t('submit_request')}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => navigate(`/traffic-light/${qrPublicCode}`)}
                  >
                    {t('cancel')}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}

          {pageMode === 'success' && (
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Stack spacing={3} alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleOutlineOutlinedIcon color="success" />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {t('request_submitted_success')}
                  </Typography>
                </Stack>

                <Alert severity="success" sx={{ width: '100%' }}>
                  {successState?.requestId
                    ? `${t('request_submitted_success')} (#${
                        successState.requestId
                      })`
                    : t('request_submitted_success')}
                </Alert>

                {successState?.requestTitle && (
                  <Typography variant="body1" color="text.secondary">
                    {successState.requestTitle}
                  </Typography>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      navigate(`/traffic-light/${qrPublicCode}/report`)
                    }
                  >
                    {t('report_another_issue')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/traffic-light/${qrPublicCode}`)}
                  >
                    {t('back_to_point')}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
