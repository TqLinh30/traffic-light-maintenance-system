import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import Location, {
  LocationMiniDTO,
  LocationRow
} from '../models/owns/location';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';
import { Pageable, pageableToQueryParams } from '../models/owns/page';

interface LocationState {
  locations: Location[];
  locationsHierarchy: LocationRow[];
  locationsMini: LocationMiniDTO[];
  loadingGet: boolean;
}

const initialState: LocationState = {
  locations: [],
  locationsHierarchy: [],
  locationsMini: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'locations',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getLocations(
      state: LocationState,
      action: PayloadAction<{ locations: Location[] }>
    ) {
      const { locations } = action.payload;
      state.locations = locations;
    },
    getLocationsMini(
      state: LocationState,
      action: PayloadAction<{ locations: LocationMiniDTO[] }>
    ) {
      const { locations } = action.payload;
      state.locationsMini = locations;
    },
    addLocation(
      state: LocationState,
      action: PayloadAction<{ location: Location }>
    ) {
      const { location } = action.payload;
      state.locations = [...state.locations, location];
      const alreadyInHierarchy = state.locationsHierarchy.some(
        (existingLocation) => existingLocation.id === location.id
      );
      if (!alreadyInHierarchy && !location.parentLocation) {
        state.locationsHierarchy = [
          ...state.locationsHierarchy,
          {
            ...location,
            hierarchy: [location.id]
          }
        ];
      }
    },
    editLocation(
      state: LocationState,
      action: PayloadAction<{ location: Location }>
    ) {
      const { location } = action.payload;
      const locationIndex = state.locations.findIndex(
        (loc) => loc.id === location.id
      );
      if (locationIndex === -1) {
        state.locations = [...state.locations, location];
      } else {
        state.locations[locationIndex] = location;
      }
      state.locationsHierarchy = state.locationsHierarchy.map(
        (existingLocation) => {
          if (existingLocation.id !== location.id) {
            return existingLocation;
          }

          return {
            ...existingLocation,
            ...location,
            hierarchy: existingLocation.hierarchy,
            childrenFetched: existingLocation.childrenFetched,
            hasChildren:
              (location as LocationRow).hasChildren ??
              existingLocation.hasChildren
          };
        }
      );
      state.locationsMini = state.locationsMini.map((existingLocation) =>
        existingLocation.id === location.id
          ? {
              ...existingLocation,
              name: location.name,
              address: location.address,
              customId: location.customId,
              parentId:
                location.parentLocation?.id ?? existingLocation.parentId
            }
          : existingLocation
      );
    },
    deleteLocation(
      state: LocationState,
      action: PayloadAction<{ id: number }>
    ) {
      const { id } = action.payload;
      const deletedIds = new Set<number>([id]);
      let foundNestedLocation = true;

      while (foundNestedLocation) {
        foundNestedLocation = false;
        for (const location of state.locations) {
          const parentId = location.parentLocation?.id;
          if (
            parentId &&
            deletedIds.has(parentId) &&
            !deletedIds.has(location.id)
          ) {
            deletedIds.add(location.id);
            foundNestedLocation = true;
          }
        }
        for (const location of state.locationsHierarchy) {
          const belongsToDeletedBranch = location.hierarchy?.some(
            (hierarchyId) => deletedIds.has(hierarchyId)
          );
          if (belongsToDeletedBranch && !deletedIds.has(location.id)) {
            deletedIds.add(location.id);
            foundNestedLocation = true;
          }
        }
        for (const location of state.locationsMini) {
          if (
            location.parentId &&
            deletedIds.has(location.parentId) &&
            !deletedIds.has(location.id)
          ) {
            deletedIds.add(location.id);
            foundNestedLocation = true;
          }
        }
      }

      state.locations = state.locations.filter(
        (location) => !deletedIds.has(location.id)
      );
      state.locationsHierarchy = state.locationsHierarchy.filter(
        (location) =>
          !deletedIds.has(location.id) &&
          !location.hierarchy?.some((hierarchyId) =>
            deletedIds.has(hierarchyId)
          )
      );
      state.locationsMini = state.locationsMini.filter(
        (location) => !deletedIds.has(location.id)
      );
    },
    getLocationChildren(
      state: LocationState,
      action: PayloadAction<{ locations: LocationRow[]; id: number }>
    ) {
      const { locations, id } = action.payload;
      const parent = state.locationsHierarchy.findIndex(
        (location) => location.id === id
      );
      if (parent !== -1)
        state.locationsHierarchy[parent].childrenFetched = true;

      state.locationsHierarchy = locations.reduce((acc, location) => {
        //check if location already exists in state
        const locationInState = state.locationsHierarchy.findIndex(
          (location1) => location1.id === location.id
        );
        //not found
        if (locationInState === -1) return [...acc, location];
        //found
        acc[locationInState] = location;
        return acc;
      }, state.locationsHierarchy);
    },
    setLoadingGet(
      state: LocationState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    },
    resetHierarchy(state: LocationState, action: PayloadAction<{}>) {
      state.locationsHierarchy = [];
    }
  }
});

export const reducer = slice.reducer;

export const getLocations = (): AppThunk => async (dispatch) => {
  const locations = await api.get<Location[]>('locations');
  dispatch(slice.actions.getLocations({ locations }));
};
export const getLocationsMini = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const locations = await api.get<LocationMiniDTO[]>('locations/mini');

    dispatch(slice.actions.getLocationsMini({ locations }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};
export const getPublicLocationsMini =
  (portalUUID: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const locations = await api.get<LocationMiniDTO[]>(
        `locations/public/mini/${portalUUID}`
      );
      dispatch(slice.actions.getLocationsMini({ locations }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const addLocation =
  (location): AppThunk =>
  async (dispatch) => {
    const locationResponse = await api.post<Location>('locations', location);
    dispatch(slice.actions.addLocation({ location: locationResponse }));
  };
export const editLocation =
  (id: number, location): AppThunk =>
  async (dispatch) => {
    const locationResponse = await api.patch<Location>(
      `locations/${id}`,
      location
    );
    dispatch(slice.actions.editLocation({ location: locationResponse }));
  };
export const getSingleLocation =
  (id: number): AppThunk =>
  async (dispatch) => {
    const locationResponse = await api.get<Location>(`locations/${id}`);
    dispatch(slice.actions.editLocation({ location: locationResponse }));
  };
export const deleteLocation =
  (id: number): AppThunk =>
  async (dispatch) => {
    const locationResponse = await api.deletes<{ success: boolean }>(
      `locations/${id}`
    );
    const { success } = locationResponse;
    if (success) {
      dispatch(slice.actions.deleteLocation({ id }));
    }
  };

export const getLocationChildren =
  (id: number, parents: number[], pageable: Pageable): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const locations = await api.get<Location[]>(
      `locations/children/${id}?${pageableToQueryParams(pageable)}`
    );
    dispatch(
      slice.actions.getLocationChildren({
        id,
        locations: locations.map((location) => {
          return { ...location, hierarchy: [...parents, location.id] };
        })
      })
    );
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };

export const resetLocationsHierarchy =
  (pageable: Pageable, callApi: boolean): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.resetHierarchy({}));
    if (callApi) {
      dispatch(getLocationChildren(0, [], pageable));
    }
  };

export default slice;
