import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { googleMapsConfig } from '../../config';
import { View } from '../../components/Themed';

export interface TrafficLightCoordinates {
  lat: number;
  lng: number;
}

interface TrafficLightLocationMapPickerProps {
  value: TrafficLightCoordinates | null;
  address?: string;
  onChange: (coordinates: TrafficLightCoordinates) => void;
  onAddressResolved?: (address: string) => void;
}

const DEFAULT_CENTER = {
  lat: 23.6978,
  lng: 120.9605
};

const buildLeafletMapHtml = () => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        overflow: hidden;
      }

      .leaflet-control-attribution {
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const defaultCenter = [${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}];
      const map = L.map('map', {
        zoomControl: true
      }).setView(defaultCenter, 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let marker = null;

      const postMessage = (payload) => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      window.gm_authFailure = () => {
        postMessage({
          type: 'error',
          message: 'Google Maps authorization failed for this key.'
        });
      };

      window.setMarker = (lat, lng, fit = true) => {
        const coordinates = [lat, lng];
        if (!marker) {
          marker = L.marker(coordinates).addTo(map);
        } else {
          marker.setLatLng(coordinates);
        }

        if (fit) {
          map.setView(coordinates, 17);
        }
      };

      map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        window.setMarker(lat, lng, false);
        postMessage({
          type: 'select',
          lat,
          lng
        });
      });

      postMessage({ type: 'ready' });
    </script>
  </body>
</html>`;

const buildGoogleMapHtml = (apiKey: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        overflow: hidden;
        font-family: Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const defaultCenter = {
        lat: ${DEFAULT_CENTER.lat},
        lng: ${DEFAULT_CENTER.lng}
      };

      let map = null;
      let marker = null;
      let geocoder = null;

      const postMessage = (payload) => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      const setMarker = (lat, lng, fit = true) => {
        const position = { lat, lng };
        if (!marker) {
          marker = new google.maps.Marker({
            map,
            position,
            draggable: true,
            animation: google.maps.Animation.DROP
          });

          marker.addListener('dragend', (event) => {
            if (!event.latLng) {
              return;
            }

            handleSelection(event.latLng.lat(), event.latLng.lng(), false);
          });
        } else {
          marker.setPosition(position);
        }

        if (fit && map) {
          map.panTo(position);
          map.setZoom(17);
        }
      };

      const postSelection = (lat, lng, type, address = null) => {
        postMessage({
          type,
          lat,
          lng,
          address
        });
      };

      const reverseGeocode = (lat, lng, type) => {
        if (!geocoder) {
          postSelection(lat, lng, type, null);
          return;
        }

        geocoder.geocode(
          {
            location: { lat, lng }
          },
          (results, status) => {
            if (status === 'OK' && results && results.length) {
              postSelection(
                lat,
                lng,
                type,
                results[0].formatted_address || null
              );
              return;
            }

            postSelection(lat, lng, type, null);
          }
        );
      };

      const handleSelection = (lat, lng, fit = true) => {
        setMarker(lat, lng, fit);
        reverseGeocode(lat, lng, 'select');
      };

      window.setMarker = (lat, lng, fit = true) => {
        setMarker(lat, lng, fit);
      };

      window.searchPlace = (query) => {
        const normalizedQuery = String(query || '').trim();
        if (!normalizedQuery) {
          postMessage({
            type: 'searchError',
            message: 'Enter an address to search.'
          });
          return;
        }

        if (!geocoder) {
          postMessage({
            type: 'searchError',
            message: 'Google Maps is still loading.'
          });
          return;
        }

        geocoder.geocode(
          {
            address: normalizedQuery,
            region: 'TW'
          },
          (results, status) => {
            if (status !== 'OK' || !results || !results.length) {
              postMessage({
                type: 'searchError',
                message: 'No place matched that search.'
              });
              return;
            }

            const bestResult = results[0];
            const location = bestResult.geometry && bestResult.geometry.location;
            if (!location) {
              postMessage({
                type: 'searchError',
                message: 'No place matched that search.'
              });
              return;
            }

            const lat = location.lat();
            const lng = location.lng();
            setMarker(lat, lng, false);

            if (map) {
              if (bestResult.geometry && bestResult.geometry.viewport) {
                map.fitBounds(bestResult.geometry.viewport);
              } else {
                map.panTo({ lat, lng });
                map.setZoom(17);
              }
            }

            postSelection(
              lat,
              lng,
              'searchResult',
              bestResult.formatted_address || normalizedQuery
            );
          }
        );
      };

      function initMap() {
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById('map'), {
          center: defaultCenter,
          zoom: 7,
          clickableIcons: true,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true
        });

        map.addListener('click', (event) => {
          if (!event.latLng) {
            return;
          }

          handleSelection(event.latLng.lat(), event.latLng.lng(), false);
        });

        postMessage({ type: 'ready' });
      }

      window.initMap = initMap;
    </script>
    <script
      async
      defer
      src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap"
    ></script>
  </body>
</html>`;

const geocodeAddressWithOsm = async (query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tw&q=${encodeURIComponent(
    trimmedQuery
  )}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'zh-TW,en-US;q=0.8,en;q=0.6'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to search the map right now.');
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) {
    return null;
  }

  return {
    coordinates: {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon)
    },
    address: results[0].display_name
  };
};

const reverseGeocodeWithOsm = async (coordinates: TrafficLightCoordinates) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.lat}&lon=${coordinates.lng}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'zh-TW,en-US;q=0.8,en;q=0.6'
    }
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as {
    display_name?: string;
  };

  return result.display_name ?? null;
};

export default function TrafficLightLocationMapPicker({
  value,
  address,
  onChange,
  onAddressResolved
}: TrafficLightLocationMapPickerProps) {
  const theme = useTheme();
  const webViewRef = useRef<WebView | null>(null);
  const pendingGoogleSearchRef = useRef<string | null>(null);
  const googleApiKey = googleMapsConfig.apiKey?.trim() ?? '';
  const useGoogleMaps = Boolean(googleApiKey);
  const [searchQuery, setSearchQuery] = useState(address ?? '');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (address && address !== searchQuery) {
      setSearchQuery(address);
    }
  }, [address]);

  useEffect(() => {
    setMapReady(false);
  }, [useGoogleMaps, googleApiKey]);

  const html = useMemo(
    () =>
      useGoogleMaps ? buildGoogleMapHtml(googleApiKey) : buildLeafletMapHtml(),
    [googleApiKey, useGoogleMaps]
  );

  const syncMarker = (coordinates: TrafficLightCoordinates) => {
    webViewRef.current?.injectJavaScript(
      `window.setMarker(${coordinates.lat}, ${coordinates.lng}, true); true;`
    );
  };

  useEffect(() => {
    if (mapReady && value) {
      syncMarker(value);
    }
  }, [mapReady, value?.lat, value?.lng]);

  const runPendingGoogleSearch = () => {
    if (!mapReady || !pendingGoogleSearchRef.current) {
      return;
    }

    const query = pendingGoogleSearchRef.current;
    pendingGoogleSearchRef.current = null;
    webViewRef.current?.injectJavaScript(
      `window.searchPlace(${JSON.stringify(query)}); true;`
    );
  };

  const handleFallbackSearch = async (query: string) => {
    const result = await geocodeAddressWithOsm(query);
    if (!result) {
      setSearchError('No place matched that search.');
      return;
    }

    onChange(result.coordinates);
    syncMarker(result.coordinates);
    if (onAddressResolved) {
      onAddressResolved(result.address);
    }
  };

  const handleSearch = async () => {
    const query = (searchQuery || address || '').trim();
    if (!query) {
      setSearchError('Enter an address or nearby landmark to search.');
      return;
    }

    setSearchError(null);
    setLoadingSearch(true);

    try {
      if (!useGoogleMaps) {
        await handleFallbackSearch(query);
        setLoadingSearch(false);
        return;
      }

      if (!mapReady) {
        pendingGoogleSearchRef.current = query;
        return;
      }

      webViewRef.current?.injectJavaScript(
        `window.searchPlace(${JSON.stringify(query)}); true;`
      );
    } catch (error) {
      setSearchError('Unable to search the map right now.');
      setLoadingSearch(false);
    }
  };

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        lat?: number;
        lng?: number;
        address?: string | null;
        message?: string;
      };

      if (payload.type === 'ready') {
        setMapReady(true);
        if (value) {
          syncMarker(value);
        }
        runPendingGoogleSearch();
        return;
      }

      if (
        (payload.type === 'select' || payload.type === 'searchResult') &&
        typeof payload.lat === 'number' &&
        typeof payload.lng === 'number'
      ) {
        const coordinates = {
          lat: payload.lat,
          lng: payload.lng
        };

        setSearchError(null);
        setLoadingSearch(false);
        onChange(coordinates);

        if (payload.address && onAddressResolved) {
          onAddressResolved(payload.address);
          return;
        }

        if (!useGoogleMaps) {
          const resolvedAddress = await reverseGeocodeWithOsm(coordinates);
          if (resolvedAddress && onAddressResolved) {
            onAddressResolved(resolvedAddress);
          }
        }
        return;
      }

      if (payload.type === 'searchError' || payload.type === 'error') {
        setSearchError(payload.message || 'Unable to read the selected point.');
        setLoadingSearch(false);
      }
    } catch (error) {
      setSearchError('Unable to read the selected point.');
      setLoadingSearch(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={useGoogleMaps ? 'Find on Google Maps' : 'Find on map'}
        placeholder="Search the address or nearby landmark"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button
        mode="outlined"
        style={styles.searchButton}
        onPress={() => {
          void handleSearch();
        }}
        loading={loadingSearch}
        disabled={loadingSearch}
      >
        {useGoogleMaps
          ? 'Use this address on Google Maps'
          : 'Use this address on the map'}
      </Button>
      <HelperText type={searchError ? 'error' : 'info'} visible>
        {searchError ||
          (useGoogleMaps
            ? 'Google Maps is active here. Tap the map, drag the pin, or search to lock the pole coordinates.'
            : 'Tap the map to place the pole. The app will keep the selected latitude and longitude.')}
      </HelperText>
      <View
        style={[
          styles.mapFrame,
          {
            borderColor: theme.colors.outline
          }
        ]}
      >
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          style={styles.map}
        />
      </View>
      <Text variant="bodySmall" style={styles.coordinates}>
        {value
          ? `Lat ${value.lat.toFixed(6)} | Lng ${value.lng.toFixed(6)}`
          : 'No point selected yet'}
      </Text>
      {useGoogleMaps && (
        <Text variant="bodySmall" style={styles.providerNote}>
          Google Maps search, map controls, and pin placement are now handled
          directly inside the mobile picker.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  searchButton: {
    alignSelf: 'flex-start'
  },
  mapFrame: {
    height: 260,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  coordinates: {
    opacity: 0.7
  },
  providerNote: {
    opacity: 0.65
  }
});
