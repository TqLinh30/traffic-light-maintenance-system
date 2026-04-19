import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  withGoogleMap,
  withScriptjs
} from 'react-google-maps';
import { mapStyle } from './mapStyle';
import { googleMapsConfig } from '../../../../config';
import { Box, Button, Link, Typography } from '@mui/material';

interface Location {
  id: number;
  title: string;
  address: string;
  subtitle?: string;
  coordinates: { lat: number; lng: number };
  href?: string;
  markerColor?: string;
}
interface MapProps {
  dimensions?: { width: number | string; height: number | string };
  locations?: Location[];
  select?: boolean;
  selected?: { lat: number; lng: number } | null;
  searchAddress?: string | null;
  searchRequestId?: number;
  onAddressConfirm?: (address: string) => void;
  onSelect?: (coordinates: { lat: number; lng: number }) => void;
}

interface SelectedPlacePreview {
  title?: string | null;
  address: string;
  coordinates: { lat: number; lng: number };
  googleMapsUrl?: string | null;
  loading: boolean;
}

interface NearbyPlaceResolution {
  address: string | null;
  title?: string | null;
  coordinates?: { lat: number; lng: number };
  distanceInMeters?: number | null;
}

const DEFAULT_SELECT_CENTER = { lat: 23.6978, lng: 120.9605 };
const DEFAULT_SELECT_ZOOM = 7;
const SELECTED_LOCATION_ZOOM = 16;
const NAMED_POINT_OF_INTEREST_TYPES = [
  'point_of_interest',
  'establishment',
  'restaurant',
  'store',
  'tourist_attraction',
  'premise',
  'subpremise'
];
const BROADER_AREA_TYPES = [
  'route',
  'intersection',
  'neighborhood',
  'sublocality',
  'sublocality_level_1',
  'locality',
  'administrative_area_level_3',
  'administrative_area_level_2'
];
const SPECIFIC_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise'];

const buildCoordinateLabel = (coordinates: { lat: number; lng: number }) =>
  `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;

const hasAnyType = (types: string[] | undefined, candidateTypes: string[]) =>
  candidateTypes.some((candidateType) => types?.includes(candidateType));

const isNamedPointOfInterestType = (types: string[] | undefined) =>
  hasAnyType(types, NAMED_POINT_OF_INTEREST_TYPES);

function LocalMap({
  locations = [],
  select,
  onAddressConfirm,
  onSelect,
  searchAddress,
  searchRequestId,
  selected
}: MapProps) {
  const mapRef = useRef<GoogleMap>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>();
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(selected ?? null);
  const [selectedPlacePreview, setSelectedPlacePreview] =
    useState<SelectedPlacePreview | null>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledSearchKeyRef = useRef<string | null>(null);
  const onSelectRef = useRef<MapProps['onSelect']>(onSelect);
  const selectedCoordinatesRef = useRef<{
    lat: number;
    lng: number;
  } | null>(selected ?? null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedCoordinatesRef.current = selectedCoordinates;
  }, [selectedCoordinates]);

  const getPlacesService = () => {
    if (!window.google?.maps?.places?.PlacesService) {
      return null;
    }

    return new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
  };

  const focusOnCoordinates = (
    coordinates: { lat: number; lng: number },
    viewport?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  ) => {
    if (viewport) {
      mapRef.current?.fitBounds(viewport);
      return;
    }

    mapRef.current?.panTo(coordinates);
    (mapRef.current as any)?.setZoom?.(SELECTED_LOCATION_ZOOM);
  };

  const updateSelectedPlacePreview = ({
    title = null,
    address,
    coordinates,
    googleMapsUrl = null,
    loading
  }: SelectedPlacePreview) => {
    setSelectedPlacePreview({
      title,
      address,
      coordinates,
      googleMapsUrl,
      loading
    });
  };

  const findPlaceByQuery = (
    query: string,
    onResolved: (
      address: string | null,
      title?: string | null,
      coordinates?: { lat: number; lng: number },
      viewport?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
      googleMapsUrl?: string | null
    ) => void
  ) => {
    const service = getPlacesService();
    if (!service || !window.google?.maps?.places) {
      onResolved(null);
      return;
    }

    service.findPlaceFromQuery(
      {
        query,
        fields: ['formatted_address', 'geometry', 'name', 'url']
      },
      (results, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results?.length
        ) {
          onResolved(null);
          return;
        }

        const bestResult = results[0];
        const location = bestResult.geometry?.location;
        if (!location) {
          onResolved(
            bestResult.formatted_address || bestResult.name || null,
            bestResult.name || null,
            undefined,
            undefined,
            bestResult.url || null
          );
          return;
        }

        onResolved(
          bestResult.formatted_address || bestResult.name || null,
          bestResult.name || null,
          {
            lat: location.lat(),
            lng: location.lng()
          },
          bestResult.geometry?.viewport,
          bestResult.url || null
        );
      }
    );
  };

  const findNearbyPlace = (
    coordinates: { lat: number; lng: number },
    onResolved: (preview: NearbyPlaceResolution | null) => void
  ) => {
    const service = getPlacesService();
    if (!service || !window.google?.maps?.places) {
      onResolved(null);
      return;
    }

    service.nearbySearch(
      {
        location: new window.google.maps.LatLng(
          coordinates.lat,
          coordinates.lng
        ),
        radius: 30
      },
      (results, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results?.length
        ) {
          onResolved(null);
          return;
        }

        const bestResult = results[0];
        onResolved({
          address: bestResult.vicinity || bestResult.name || null,
          title:
            isNamedPointOfInterestType(bestResult.types) &&
            bestResult.name &&
            bestResult.name !== bestResult.vicinity
              ? bestResult.name
              : null,
          coordinates: bestResult.geometry?.location
            ? {
                lat: bestResult.geometry.location.lat(),
                lng: bestResult.geometry.location.lng()
              }
            : undefined,
          distanceInMeters: getDistanceInMeters(
            coordinates,
            bestResult.geometry?.location
          )
        });
      }
    );
  };

  const getDistanceInMeters = (
    coordinates: { lat: number; lng: number },
    location: google.maps.LatLng | undefined
  ) => {
    if (!location || !window.google?.maps?.geometry?.spherical) {
      return null;
    }

    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(coordinates.lat, coordinates.lng),
      location
    );
  };

  const pickBestReverseGeocodeResult = (
    results: google.maps.GeocoderResult[],
    coordinates: { lat: number; lng: number }
  ) => {
    if (!results.length) {
      return null;
    }

    const bestResult = results[0];
    const distanceInMeters = getDistanceInMeters(
      coordinates,
      bestResult.geometry?.location
    );
    const isOverSpecificAddress =
      hasAnyType(bestResult.types, SPECIFIC_ADDRESS_TYPES) &&
      ((distanceInMeters !== null && distanceInMeters > 40) ||
        bestResult.geometry?.location_type ===
          window.google.maps.GeocoderLocationType.RANGE_INTERPOLATED);

    if (!isOverSpecificAddress) {
      return bestResult;
    }

    return (
      results.find((result) => hasAnyType(result.types, BROADER_AREA_TYPES)) ||
      bestResult
    );
  };

  const resolvePlaceIdWithGeocoder = (
    placeId: string,
    onResolved: (result: google.maps.GeocoderResult | null) => void
  ) => {
    if (!window.google?.maps?.Geocoder) {
      onResolved(null);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results?.length) {
        onResolved(results[0]);
        return;
      }

      onResolved(null);
    });
  };

  const applyResolvedPlaceSelection = ({
    title = null,
    address,
    coordinates,
    viewport,
    googleMapsUrl = null
  }: {
    title?: string | null;
    address: string;
    coordinates: { lat: number; lng: number };
    viewport?:
      | google.maps.LatLngBounds
      | google.maps.LatLngBoundsLiteral
      | undefined;
    googleMapsUrl?: string | null;
  }) => {
    setSelectedCoordinates(coordinates);
    updateSelectedPlacePreview({
      title,
      address,
      coordinates,
      googleMapsUrl,
      loading: false
    });
    focusOnCoordinates(coordinates, viewport);
    onSelectRef.current?.(coordinates);
  };

  const applyGeocoderPlaceSelection = (
    placeResult: google.maps.GeocoderResult,
    coordinates: { lat: number; lng: number }
  ) => {
    const resolvedAddress = placeResult.formatted_address;
    const finalizeSelection = (title?: string | null) => {
      applyResolvedPlaceSelection({
        title: title && title !== resolvedAddress ? title : null,
        address: resolvedAddress,
        coordinates,
        viewport: placeResult.geometry?.viewport
      });
    };

    findNearbyPlace(coordinates, (nearbyPlace) => {
      const shouldUseNearbyTitle =
        nearbyPlace?.title &&
        nearbyPlace.distanceInMeters !== null &&
        nearbyPlace.distanceInMeters !== undefined &&
        nearbyPlace.distanceInMeters <= 40;

      finalizeSelection(shouldUseNearbyTitle ? nearbyPlace.title : null);
    });
  };

  const reverseGeocodeCoordinates = (
    coordinates: { lat: number; lng: number },
    onResolved?: (address: string) => void
  ) => {
    const fallbackAddress = buildCoordinateLabel(coordinates);

    updateSelectedPlacePreview({
      address: fallbackAddress,
      coordinates,
      loading: true
    });

    if (!window.google?.maps?.Geocoder) {
      updateSelectedPlacePreview({
        address: fallbackAddress,
        coordinates,
        loading: false
      });
      focusOnCoordinates(coordinates);
      onResolved?.(fallbackAddress);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      {
        location: new window.google.maps.LatLng(
          coordinates.lat,
          coordinates.lng
        )
      },
      (results, status) => {
        if (
          status === window.google.maps.GeocoderStatus.OK &&
          results?.length &&
          pickBestReverseGeocodeResult(results, coordinates)?.formatted_address
        ) {
          const bestResult = pickBestReverseGeocodeResult(results, coordinates);
          const resolvedAddress =
            bestResult?.formatted_address || fallbackAddress;
          updateSelectedPlacePreview({
            address: resolvedAddress,
            coordinates,
            loading: false
          });
          focusOnCoordinates(coordinates);
          onResolved?.(resolvedAddress);
          return;
        }

        findNearbyPlace(coordinates, (nearbyPlace) => {
          const resolvedAddress = nearbyPlace?.address || fallbackAddress;
          updateSelectedPlacePreview({
            title: nearbyPlace?.title || null,
            address: resolvedAddress,
            coordinates,
            loading: false
          });
          focusOnCoordinates(coordinates);
          onResolved?.(resolvedAddress);
        });
      }
    );
  };

  const resolvePlaceIdSelection = (
    placeId: string,
    coordinates: { lat: number; lng: number }
  ) => {
    const service = getPlacesService();
    if (!service || !window.google?.maps?.places) {
      resolvePlaceIdWithGeocoder(placeId, (placeResult) => {
        if (
          !placeResult ||
          !placeResult.formatted_address ||
          !isNamedPointOfInterestType(placeResult.types)
        ) {
          reverseGeocodeCoordinates(coordinates);
          return;
        }

        applyGeocoderPlaceSelection(placeResult, coordinates);
      });
      return;
    }

    updateSelectedPlacePreview({
      address: buildCoordinateLabel(coordinates),
      coordinates,
      loading: true
    });

    service.getDetails(
      {
        placeId,
        fields: ['formatted_address', 'geometry', 'name', 'types', 'url']
      },
      (place, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          resolvePlaceIdWithGeocoder(placeId, (placeResult) => {
            if (
              !placeResult ||
              !placeResult.formatted_address ||
              !isNamedPointOfInterestType(placeResult.types)
            ) {
              reverseGeocodeCoordinates(coordinates);
              return;
            }

            applyGeocoderPlaceSelection(placeResult, coordinates);
          });
          return;
        }

        if (!isNamedPointOfInterestType(place.types)) {
          reverseGeocodeCoordinates(coordinates);
          return;
        }

        const placeCoordinates = place.geometry?.location
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          : coordinates;
        const resolvedAddress =
          place.formatted_address ||
          place.name ||
          buildCoordinateLabel(placeCoordinates);

        applyResolvedPlaceSelection({
          title:
            place.name && place.name !== resolvedAddress ? place.name : null,
          address: resolvedAddress,
          coordinates: placeCoordinates,
          googleMapsUrl: place.url || null,
          viewport: place.geometry?.viewport
        });
      }
    );
  };

  useEffect(() => {
    const bounds = new window.google.maps.LatLngBounds();
    if (!select && locations.length) {
      locations.forEach((location) => bounds.extend(location.coordinates));
      mapRef.current.fitBounds(bounds);
    }
  }, [locations, select]);

  useEffect(() => {
    if (!select || !selected) {
      return;
    }

    setSelectedCoordinates(selected);
    selectedCoordinatesRef.current = selected;
    focusOnCoordinates(selected);
  }, [selected, select]);

  useEffect(() => {
    if (!select || !searchAddress?.trim() || !window.google?.maps?.Geocoder) {
      return;
    }

    const normalizedAddress = searchAddress.trim();
    const currentSearchKey = `${searchRequestId ?? 0}:${normalizedAddress}`;
    if (currentSearchKey === lastHandledSearchKeyRef.current) {
      return;
    }

    setSelectedPlacePreview(null);

    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(() => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: normalizedAddress, region: 'TW' },
        (results, status) => {
          if (
            status !== window.google.maps.GeocoderStatus.OK ||
            !results?.length
          ) {
            findPlaceByQuery(
              normalizedAddress,
              (
                resolvedAddress,
                title,
                coordinates,
                viewport,
                googleMapsUrl
              ) => {
                if (!resolvedAddress || !coordinates) {
                  updateSelectedPlacePreview({
                    address: normalizedAddress,
                    coordinates:
                      selectedCoordinatesRef.current ?? DEFAULT_SELECT_CENTER,
                    loading: false
                  });
                  return;
                }

                lastHandledSearchKeyRef.current = currentSearchKey;
                setSelectedCoordinates(coordinates);
                updateSelectedPlacePreview({
                  title: title && title !== resolvedAddress ? title : null,
                  address: resolvedAddress,
                  coordinates,
                  googleMapsUrl,
                  loading: false
                });
                focusOnCoordinates(coordinates, viewport);
                onSelectRef.current?.(coordinates);
              }
            );
            return;
          }

          const bestResult = results[0];
          const location = bestResult.geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };

          lastHandledSearchKeyRef.current = currentSearchKey;
          setSelectedCoordinates(coordinates);
          updateSelectedPlacePreview({
            address: bestResult.formatted_address || normalizedAddress,
            coordinates,
            loading: false
          });
          focusOnCoordinates(coordinates, bestResult.geometry.viewport);
          onSelectRef.current?.(coordinates);
        }
      );
    }, 500);

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [searchAddress, searchRequestId, select]);

  const defaultCenter = select ? DEFAULT_SELECT_CENTER : { lat: 0, lng: 0 };
  return (
    <GoogleMap
      ref={mapRef}
      onClick={(event: any) => {
        if (select) {
          if ('placeId' in event && event.placeId) {
            event.stop();
            const placeCoordinates = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            resolvePlaceIdSelection(event.placeId, placeCoordinates);
            return;
          }

          const coordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          setSelectedCoordinates(coordinates);
          focusOnCoordinates(coordinates);
          onSelectRef.current?.(coordinates);
          reverseGeocodeCoordinates(coordinates);
        }
      }}
      defaultCenter={selected ?? defaultCenter}
      defaultZoom={
        select
          ? selected
            ? SELECTED_LOCATION_ZOOM
            : DEFAULT_SELECT_ZOOM
          : locations?.length
          ? 6
          : 2
      }
      defaultOptions={{ styles: mapStyle }}
      options={{ streetViewControl: false }}
    >
      {!select && (
        <>
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={location.coordinates}
              title={location.title}
              onClick={() => setSelectedLocation(location)}
              icon={
                location.markerColor
                  ? {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: location.markerColor,
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 9
                    }
                  : {
                      url: '/static/images/markers/red.png',
                      scaledSize: new window.google.maps.Size(25, 25)
                    }
              }
            />
          ))}
          {selectedLocation && (
            <InfoWindow
              onCloseClick={() => setSelectedLocation(null)}
              position={selectedLocation.coordinates}
            >
              <Box>
                <Link
                  variant="h6"
                  color="primary"
                  href={
                    selectedLocation.href ??
                    `/app/locations/${selectedLocation.id}`
                  }
                >
                  {selectedLocation.title}
                </Link>
                {selectedLocation.subtitle && (
                  <Typography variant="subtitle2">
                    {selectedLocation.subtitle}
                  </Typography>
                )}
                <Typography variant="subtitle1">
                  {selectedLocation.address}
                </Typography>
              </Box>
            </InfoWindow>
          )}
        </>
      )}
      {select && (
        <>
          {(selectedCoordinates ?? selected) && (
            <Marker
              position={selectedCoordinates ?? selected}
              icon={{
                url: '/static/images/markers/red.png',
                scaledSize: new window.google.maps.Size(25, 25)
              }}
            />
          )}
          {selectedPlacePreview && (
            <InfoWindow
              onCloseClick={() => setSelectedPlacePreview(null)}
              position={selectedPlacePreview.coordinates}
            >
              <Box sx={{ maxWidth: 280 }}>
                {selectedPlacePreview.title && (
                  <Typography variant="subtitle1" fontWeight={700}>
                    {selectedPlacePreview.title}
                  </Typography>
                )}
                <Typography
                  variant={selectedPlacePreview.title ? 'body1' : 'subtitle1'}
                  fontWeight={selectedPlacePreview.title ? 400 : 700}
                  sx={selectedPlacePreview.title ? { mt: 0.5 } : undefined}
                >
                  {selectedPlacePreview.loading
                    ? 'Resolving location...'
                    : selectedPlacePreview.address}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  {selectedPlacePreview.coordinates.lat.toFixed(6)},{' '}
                  {selectedPlacePreview.coordinates.lng.toFixed(6)}
                </Typography>
                {selectedPlacePreview.googleMapsUrl && (
                  <Link
                    href={selectedPlacePreview.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    display="inline-block"
                    sx={{ mt: 1 }}
                  >
                    View on Google Maps
                  </Link>
                )}
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 1.5 }}
                  disabled={selectedPlacePreview.loading}
                  onClick={() => {
                    onAddressConfirm?.(selectedPlacePreview.address);
                    setSelectedPlacePreview(null);
                  }}
                >
                  OK
                </Button>
              </Box>
            </InfoWindow>
          )}
        </>
      )}
    </GoogleMap>
  );
}

const MapWrapped = withScriptjs(withGoogleMap(LocalMap));

export default function Map({
  dimensions,
  locations = [],
  select,
  onAddressConfirm,
  searchAddress,
  searchRequestId,
  selected,
  onSelect
}: MapProps) {
  const { apiKey } = googleMapsConfig;

  return (
    <div
      style={{
        width: dimensions.width ?? 500,
        height: dimensions.height ?? 500
      }}
    >
      <MapWrapped
        locations={locations}
        select={select}
        onAddressConfirm={onAddressConfirm}
        onSelect={onSelect}
        searchAddress={searchAddress}
        searchRequestId={searchRequestId}
        selected={selected}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${apiKey}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100%` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  );
}
