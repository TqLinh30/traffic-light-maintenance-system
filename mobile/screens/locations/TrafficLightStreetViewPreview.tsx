import React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { googleMapsConfig } from '../../config';
import { View } from '../../components/Themed';
import { TrafficLightCoordinates } from './TrafficLightLocationMapPicker';

interface TrafficLightStreetViewPreviewProps {
  coordinates: TrafficLightCoordinates | null;
}

const buildStreetViewHtml = (
  apiKey: string,
  coordinates: TrafficLightCoordinates
) => `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body, #panorama {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        overflow: hidden;
        background: #111827;
        font-family: Arial, sans-serif;
      }

      #overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: white;
        text-align: center;
        background: rgba(17, 24, 39, 0.72);
        z-index: 1;
      }

      #overlay.hidden {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="overlay">Loading Street View...</div>
    <div id="panorama"></div>
    <script>
      const coordinates = {
        lat: ${coordinates.lat},
        lng: ${coordinates.lng}
      };

      const overlay = document.getElementById('overlay');

      const setOverlay = (message) => {
        if (!overlay) {
          return;
        }

        overlay.textContent = message;
        overlay.classList.remove('hidden');
      };

      const hideOverlay = () => {
        if (!overlay) {
          return;
        }

        overlay.classList.add('hidden');
      };

      window.gm_authFailure = () => {
        setOverlay('Google Maps authorization failed for this key.');
      };

      function initPanorama() {
        const target = new google.maps.LatLng(coordinates.lat, coordinates.lng);
        const service = new google.maps.StreetViewService();

        service.getPanorama(
          {
            location: target,
            radius: 75,
            source: google.maps.StreetViewSource.OUTDOOR
          },
          (streetViewData, status) => {
            const panoramaLocation = streetViewData?.location?.latLng;
            if (
              status !== google.maps.StreetViewStatus.OK ||
              !streetViewData?.location?.pano ||
              !panoramaLocation
            ) {
              setOverlay(
                'No Street View panorama is available for the selected point.'
              );
              return;
            }

            const headingToSelectedPoint =
              google.maps.geometry?.spherical?.computeHeading(
                panoramaLocation,
                target
              ) ?? 0;
            const initialHeading = Number.isFinite(headingToSelectedPoint)
              ? headingToSelectedPoint
              : 0;

            const panorama = new google.maps.StreetViewPanorama(
              document.getElementById('panorama'),
              {
                addressControl: true,
                clickToGo: true,
                disableDefaultUI: false,
                fullscreenControl: false,
                imageDateControl: true,
                linksControl: true,
                motionTracking: false,
                motionTrackingControl: true,
                panControl: true,
                showRoadLabels: true,
                zoomControl: true
              }
            );

            panorama.setPano(streetViewData.location.pano);
            panorama.setPosition(panoramaLocation);
            panorama.setPov({
              heading: initialHeading,
              pitch: 0
            });
            panorama.setZoom(1);
            hideOverlay();
          }
        );
      }

      window.initPanorama = initPanorama;
    </script>
    <script
      async
      defer
      src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initPanorama"
    ></script>
  </body>
</html>`;

export default function TrafficLightStreetViewPreview({
  coordinates
}: TrafficLightStreetViewPreviewProps) {
  const theme = useTheme();
  const googleApiKey = googleMapsConfig.apiKey?.trim() ?? '';
  const html =
    coordinates && googleApiKey
      ? buildStreetViewHtml(googleApiKey, coordinates)
      : '';

  if (!coordinates) {
    return (
      <HelperText type="info" visible>
        Street View will appear after you search for an address or pick a point
        on the map.
      </HelperText>
    );
  }

  if (!googleApiKey) {
    return (
      <HelperText type="info" visible>
        Street View preview is unavailable because Google Maps is not configured
        in this environment.
      </HelperText>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.previewFrame,
          {
            borderColor: theme.colors.outline
          }
        ]}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          style={styles.preview}
        />
      </View>
      <Text variant="bodySmall" style={styles.helperText}>
        Drag around, zoom, and follow Street View arrows to confirm the exact
        traffic-light pole, similar to the web workflow.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  previewFrame: {
    height: 240,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12
  },
  preview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  helperText: {
    opacity: 0.72
  }
});
