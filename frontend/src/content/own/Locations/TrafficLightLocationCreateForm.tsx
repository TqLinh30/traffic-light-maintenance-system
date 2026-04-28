import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import FileUpload from '../components/FileUpload';
import SelectMapCoordinates from '../components/form/SelectMapCoordinates';

export interface TrafficLightLocationCreateValues {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  image: File[];
  files: File[];
  trafficLightEnabled: boolean;
  installationDate: string;
  expectedWarrantyDate: string;
  maintenanceHistory: string;
  streetViewCapture: StreetViewCaptureState | null;
}

export interface GeneratedLocationImagePayload {
  base64?: string | null;
  sourceUrl?: string | null;
  fileName: string;
  contentType: string;
}

export interface StreetViewCaptureState {
  position: { lat: number; lng: number };
  heading: number;
  pitch: number;
  zoom: number;
}

interface TrafficLightLocationCreateFormProps {
  apiKey?: string;
  onSubmit: (values: TrafficLightLocationCreateValues) => Promise<any>;
  submitText: string;
  initialValues?: Partial<TrafficLightLocationCreateValues>;
  existingImageUrl?: string | null;
}

const defaultInitialValues: TrafficLightLocationCreateValues = {
  name: '',
  address: '',
  coordinates: null,
  image: [],
  files: [],
  trafficLightEnabled: true,
  installationDate: '',
  expectedWarrantyDate: '',
  maintenanceHistory: '',
  streetViewCapture: null
};

const getStreetViewFovFromZoom = (zoom = 1) => {
  const normalizedZoom = Math.max(0, Math.min(5, zoom));
  return Math.max(10, Math.min(120, 180 / Math.pow(2, normalizedZoom)));
};

const buildStreetViewUrl = (
  coordinates: { lat: number; lng: number } | null,
  apiKey?: string,
  capture?: StreetViewCaptureState | null
) => {
  const targetPosition = capture?.position ?? coordinates;
  if (!targetPosition || !apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    key: apiKey,
    location: `${targetPosition.lat},${targetPosition.lng}`,
    size: '640x360',
    scale: '2',
    source: 'outdoor',
    fov: `${capture ? getStreetViewFovFromZoom(capture.zoom) : 100}`,
    pitch: `${capture?.pitch ?? 0}`,
    return_error_code: 'true'
  });

  if (capture) {
    params.set('heading', `${capture.heading}`);
  }

  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
};

const sanitizeFileName = (value?: string) => {
  const normalizedValue = value?.trim().toLowerCase() ?? '';
  const safeValue = normalizedValue
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return safeValue || 'traffic-light-location';
};

export const createStreetViewFallbackImage = async (
  coordinates: { lat: number; lng: number } | null,
  apiKey?: string,
  locationName?: string,
  capture?: StreetViewCaptureState | null
) => {
  const streetViewUrl = buildStreetViewUrl(coordinates, apiKey, capture);
  if (!streetViewUrl) {
    return null;
  }

  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const mimeType =
      blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
    const fileExtension = mimeType.includes('png') ? 'png' : 'jpg';

    return new File(
      [blob],
      `${sanitizeFileName(locationName)}-street-view.${fileExtension}`,
      {
        type: mimeType
      }
    );
  } catch (error) {
    return null;
  }
};

export const createGeneratedLocationImagePayload = async (
  coordinates: { lat: number; lng: number } | null,
  apiKey?: string,
  locationName?: string,
  capture?: StreetViewCaptureState | null
): Promise<GeneratedLocationImagePayload | null> => {
  const streetViewUrl = buildStreetViewUrl(coordinates, apiKey, capture);
  if (!streetViewUrl) {
    return null;
  }

  return {
    base64: null,
    sourceUrl: streetViewUrl,
    fileName: `${sanitizeFileName(locationName)}-street-view.jpg`,
    contentType: 'image/jpeg'
  };
};

const areCoordinatesApproximatelyEqual = (
  left: { lat: number; lng: number } | null,
  right: { lat: number; lng: number } | null,
  epsilon = 0.000001
) => {
  if (!left || !right) {
    return false;
  }

  return (
    Math.abs(left.lat - right.lat) <= epsilon &&
    Math.abs(left.lng - right.lng) <= epsilon
  );
};

function StreetViewPreview({
  apiKey,
  coordinates,
  onCoordinatesChange,
  onCaptureChange
}: {
  apiKey?: string;
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange?: (coordinates: { lat: number; lng: number }) => void;
  onCaptureChange?: (capture: StreetViewCaptureState | null) => void;
}) {
  const panoramaContainerRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const streetViewServiceRef = useRef<google.maps.StreetViewService | null>(
    null
  );
  const positionChangedListenerRef =
    useRef<google.maps.MapsEventListener | null>(null);
  const povChangedListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  );
  const zoomChangedListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  );
  const onCoordinatesChangeRef =
    useRef<typeof onCoordinatesChange>(onCoordinatesChange);
  const onCaptureChangeRef = useRef<typeof onCaptureChange>(onCaptureChange);
  const skipNextPanoramaReloadRef = useRef<boolean>(false);
  const suppressStreetViewPositionSyncRef = useRef<boolean>(false);
  const lastPanoramaCoordinatesRef = useRef<{
    lat: number;
    lng: number;
  } | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const [panoramaState, setPanoramaState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  useEffect(() => {
    onCaptureChangeRef.current = onCaptureChange;
  }, [onCaptureChange]);

  useEffect(() => {
    return () => {
      positionChangedListenerRef.current?.remove();
      povChangedListenerRef.current?.remove();
      zoomChangedListenerRef.current?.remove();
    };
  }, []);

  const publishStreetViewCapture = (
    nextCoordinates: { lat: number; lng: number },
    fallbackHeading = 0,
    fallbackPitch = 0,
    fallbackZoom = 1
  ) => {
    const panorama = panoramaRef.current;
    const pov = panorama?.getPov();
    const zoom = panorama?.getZoom();
    onCaptureChangeRef.current?.({
      position: nextCoordinates,
      heading:
        pov?.heading !== undefined && Number.isFinite(pov.heading)
          ? pov.heading
          : fallbackHeading,
      pitch:
        pov?.pitch !== undefined && Number.isFinite(pov.pitch)
          ? pov.pitch
          : fallbackPitch,
      zoom:
        zoom !== undefined && zoom !== null && Number.isFinite(zoom)
          ? zoom
          : fallbackZoom
    });
  };

  useEffect(() => {
    if (!coordinates) {
      setPanoramaState('idle');
      onCaptureChangeRef.current?.(null);
      return;
    }

    if (
      !apiKey ||
      !window.google?.maps?.StreetViewPanorama ||
      !window.google?.maps?.StreetViewService ||
      !panoramaContainerRef.current
    ) {
      setPanoramaState('error');
      onCaptureChangeRef.current?.(null);
      return;
    }

    if (
      skipNextPanoramaReloadRef.current &&
      areCoordinatesApproximatelyEqual(
        coordinates,
        lastPanoramaCoordinatesRef.current
      )
    ) {
      skipNextPanoramaReloadRef.current = false;
      setPanoramaState('ready');
      return;
    }

    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;
    const selectedLatLng = new window.google.maps.LatLng(
      coordinates.lat,
      coordinates.lng
    );

    if (!streetViewServiceRef.current) {
      streetViewServiceRef.current = new window.google.maps.StreetViewService();
    }

    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
    }
    setPanoramaState('loading');

    streetViewServiceRef.current.getPanorama(
      {
        location: selectedLatLng,
        radius: 75,
        source: window.google.maps.StreetViewSource.OUTDOOR
      },
      (streetViewData, status) => {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        const panoramaLocation = streetViewData?.location?.latLng;
        if (
          status !== window.google.maps.StreetViewStatus.OK ||
          !streetViewData?.location?.pano ||
          !panoramaLocation ||
          !panoramaContainerRef.current
        ) {
          setPanoramaState('error');
          onCaptureChangeRef.current?.(null);
          return;
        }

        const headingToSelectedPoint =
          window.google.maps.geometry?.spherical?.computeHeading(
            panoramaLocation,
            selectedLatLng
          ) ?? 0;
        const initialHeading = Number.isFinite(headingToSelectedPoint)
          ? headingToSelectedPoint
          : 0;

        if (!panoramaRef.current) {
          panoramaRef.current = new window.google.maps.StreetViewPanorama(
            panoramaContainerRef.current,
            {
              addressControl: true,
              clickToGo: true,
              disableDefaultUI: false,
              fullscreenControl: true,
              imageDateControl: true,
              linksControl: true,
              motionTracking: false,
              motionTrackingControl: true,
              panControl: true,
              showRoadLabels: true,
              zoomControl: true
            }
          );
        }

        positionChangedListenerRef.current?.remove();
        positionChangedListenerRef.current = panoramaRef.current.addListener(
          'position_changed',
          () => {
            const currentPosition = panoramaRef.current?.getPosition();
            if (!currentPosition) {
              return;
            }

            const nextCoordinates = {
              lat: currentPosition.lat(),
              lng: currentPosition.lng()
            };

            if (suppressStreetViewPositionSyncRef.current) {
              lastPanoramaCoordinatesRef.current = nextCoordinates;
              publishStreetViewCapture(nextCoordinates, initialHeading, 0, 1);
              return;
            }

            if (
              areCoordinatesApproximatelyEqual(
                nextCoordinates,
                lastPanoramaCoordinatesRef.current
              )
            ) {
              publishStreetViewCapture(nextCoordinates);
              return;
            }

            lastPanoramaCoordinatesRef.current = nextCoordinates;
            skipNextPanoramaReloadRef.current = true;
            onCoordinatesChangeRef.current?.(nextCoordinates);
            publishStreetViewCapture(nextCoordinates);
          }
        );
        povChangedListenerRef.current?.remove();
        povChangedListenerRef.current = panoramaRef.current.addListener(
          'pov_changed',
          () => {
            const currentPosition = panoramaRef.current?.getPosition();
            if (!currentPosition) {
              return;
            }
            publishStreetViewCapture({
              lat: currentPosition.lat(),
              lng: currentPosition.lng()
            });
          }
        );
        zoomChangedListenerRef.current?.remove();
        zoomChangedListenerRef.current = panoramaRef.current.addListener(
          'zoom_changed',
          () => {
            const currentPosition = panoramaRef.current?.getPosition();
            if (!currentPosition) {
              return;
            }
            publishStreetViewCapture({
              lat: currentPosition.lat(),
              lng: currentPosition.lng()
            });
          }
        );

        const panoramaCoordinates = {
          lat: panoramaLocation.lat(),
          lng: panoramaLocation.lng()
        };
        suppressStreetViewPositionSyncRef.current = true;
        lastPanoramaCoordinatesRef.current = panoramaCoordinates;
        panoramaRef.current.setOptions({
          addressControl: true,
          clickToGo: true,
          disableDefaultUI: false,
          fullscreenControl: true,
          imageDateControl: true,
          linksControl: true,
          motionTracking: false,
          motionTrackingControl: true,
          panControl: true,
          showRoadLabels: true,
          zoomControl: true
        });
        panoramaRef.current.setPano(streetViewData.location.pano);
        panoramaRef.current.setPosition(panoramaLocation);
        panoramaRef.current.setPov({
          heading: initialHeading,
          pitch: 0
        });
        panoramaRef.current.setZoom(1);
        panoramaRef.current.setVisible(true);
        publishStreetViewCapture(panoramaCoordinates, initialHeading, 0, 1);
        if (
          !areCoordinatesApproximatelyEqual(coordinates, panoramaCoordinates)
        ) {
          skipNextPanoramaReloadRef.current = true;
          onCoordinatesChangeRef.current?.(panoramaCoordinates);
        }
        window.setTimeout(() => {
          suppressStreetViewPositionSyncRef.current = false;
        }, 0);
        setPanoramaState('ready');
      }
    );
  }, [apiKey, coordinates?.lat, coordinates?.lng]);

  if (!coordinates) {
    return (
      <Alert severity="info">
        Street View will appear after you search for an address or pick a point
        on the map.
      </Alert>
    );
  }

  if (!apiKey) {
    return (
      <Alert severity="warning">
        Street View preview is unavailable because Google Maps is not configured
        in this environment.
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'common.black',
          minHeight: { xs: 240, md: 320 }
        }}
      >
        {(panoramaState === 'loading' || panoramaState === 'error') && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              zIndex: 1
            }}
          >
            {panoramaState === 'loading' ? (
              <CircularProgress size="1.6rem" />
            ) : (
              <Typography
                variant="body2"
                color="common.white"
                sx={{ px: 3, textAlign: 'center' }}
              >
                No Street View panorama is available for the selected point.
              </Typography>
            )}
          </Box>
        )}
        <Box
          ref={panoramaContainerRef}
          sx={{
            width: '100%',
            height: { xs: 240, md: 320 },
            visibility: panoramaState === 'error' ? 'hidden' : 'visible'
          }}
        />
      </Box>
      {panoramaState === 'error' && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No Street View panorama is available for the selected point.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Drag to look around the current point. Use the Street View arrows or
        double click to move along the road when Google provides nearby
        navigation. When the panorama position changes, the selected map marker
        and coordinates follow the current Street View position. If no image is
        uploaded, a best-effort Street View image matching the current view will
        still be used as the default location image when available.
      </Typography>
    </Box>
  );
}

export default function TrafficLightLocationCreateForm({
  apiKey,
  onSubmit,
  submitText,
  initialValues,
  existingImageUrl
}: TrafficLightLocationCreateFormProps) {
  const { t }: { t: any } = useTranslation();
  const resolvedInitialValues: TrafficLightLocationCreateValues = {
    ...defaultInitialValues,
    ...initialValues
  };

  return (
    <Formik<TrafficLightLocationCreateValues>
      validationSchema={Yup.object().shape({
        name: Yup.string().required(t('required_location_name')),
        address: Yup.string().required(t('required_location_address')),
        coordinates: apiKey
          ? Yup.object()
              .nullable()
              .required('Please choose a point on the map.')
          : Yup.mixed().nullable()
      })}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize
      initialValues={resolvedInitialValues}
      onSubmit={(values, { setStatus, setSubmitting }) => {
        setSubmitting(true);
        onSubmit(values).finally(() => {
          setStatus({ success: true });
          setSubmitting(false);
        });
      }}
    >
      {(formik) => {
        const coordinateError =
          typeof formik.errors.coordinates === 'string'
            ? formik.errors.coordinates
            : '';

        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={t('name')}
                placeholder={t('enter_location_name')}
                value={formik.values.name}
                onChange={(event) =>
                  formik.setFieldValue('name', event.target.value)
                }
                error={!!formik.errors.name}
                helperText={
                  typeof formik.errors.name === 'string'
                    ? formik.errors.name
                    : ''
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={t('address')}
                placeholder="Casa, Maroc"
                value={formik.values.address}
                onChange={(event) =>
                  formik.setFieldValue('address', event.target.value)
                }
                error={!!formik.errors.address}
                helperText={
                  typeof formik.errors.address === 'string'
                    ? formik.errors.address
                    : ''
                }
              />
            </Grid>

            {apiKey ? (
              <>
                <Grid item xs={12}>
                  <Typography variant="h3" sx={{ pb: 1 }}>
                    {t('map_coordinates')}
                  </Typography>
                  <SelectMapCoordinates
                    selected={formik.values.coordinates}
                    selectedHeading={
                      formik.values.streetViewCapture?.heading ?? null
                    }
                    address={formik.values.address}
                    onChange={(coordinates) => {
                      formik.setFieldValue('coordinates', coordinates);
                      formik.setFieldValue('streetViewCapture', null);
                    }}
                    onAddressConfirm={(address) => {
                      formik.setFieldValue('address', address);
                    }}
                  />
                  {coordinateError && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {coordinateError}
                    </FormHelperText>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h3" sx={{ pb: 1 }}>
                    Street View
                  </Typography>
                  <StreetViewPreview
                    apiKey={apiKey}
                    coordinates={formik.values.coordinates}
                    onCoordinatesChange={(coordinates) => {
                      formik.setFieldValue('coordinates', coordinates);
                    }}
                    onCaptureChange={(capture) => {
                      formik.setFieldValue('streetViewCapture', capture);
                    }}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Alert severity="warning">
                  Google Maps is not configured in this environment, so map
                  selection and Street View preview are unavailable.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              {existingImageUrl && !formik.values.image.length && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Current image
                  </Typography>
                  <Box
                    component="img"
                    src={existingImageUrl}
                    alt={formik.values.name || 'Current location image'}
                    sx={{
                      width: '100%',
                      maxHeight: 260,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`
                    }}
                  />
                </Box>
              )}
              <FileUpload
                multiple={false}
                title={t('image')}
                type="image"
                description={
                  existingImageUrl
                    ? 'Upload a new image to replace the current one, or leave this empty to keep the existing image.'
                    : 'Upload an image, or leave this empty to use the Street View preview automatically.'
                }
                files={formik.values.image}
                onDrop={(files) => {
                  formik.setFieldValue('image', files);
                }}
                error={
                  typeof formik.errors.image === 'string'
                    ? formik.errors.image
                    : undefined
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Installation date"
                type="date"
                value={formik.values.installationDate}
                onChange={(event) =>
                  formik.setFieldValue('installationDate', event.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected warranty date"
                type="date"
                value={formik.values.expectedWarrantyDate}
                onChange={(event) =>
                  formik.setFieldValue(
                    'expectedWarrantyDate',
                    event.target.value
                  )
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Repair or maintenance history"
                placeholder="Optional notes about previous repairs or maintenance."
                value={formik.values.maintenanceHistory}
                onChange={(event) =>
                  formik.setFieldValue('maintenanceHistory', event.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                onClick={() => formik.handleSubmit()}
                startIcon={
                  formik.isSubmitting ? <CircularProgress size="1rem" /> : null
                }
                disabled={formik.isSubmitting}
              >
                {submitText}
              </Button>
            </Grid>
          </Grid>
        );
      }}
    </Formik>
  );
}
