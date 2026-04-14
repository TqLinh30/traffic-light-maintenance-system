import { Helmet } from 'react-helmet-async';
import {
  Box,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IField } from '../type';
import ReplayTwoToneIcon from '@mui/icons-material/ReplayTwoTone';
import Location, { LocationRow } from '../../../models/owns/location';
import * as React from 'react';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import {
  addLocation,
  deleteLocation,
  editLocation,
  getLocationChildren,
  getLocations,
  resetLocationsHierarchy
} from '../../../slices/location';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDispatch, useSelector } from '../../../store';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Form from '../components/form';
import * as Yup from 'yup';
import { isNumeric } from '../../../utils/validators';
import LocationDetails from './LocationDetails';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../components/Map';
import { formatSelect, formatSelectMultiple } from '../../../utils/formatters';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import { handleFileUpload, getImageAndFiles } from '../../../utils/overall';
import { getLocationUrl } from '../../../utils/urlPaths';
import { useExport } from '../../../hooks/useExport';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';
import { Pageable, Sort } from '../../../models/owns/page';
import { googleMapsConfig } from '../../../config';
import SplitButton from '../components/SplitButton';
import CustomDatagrid2, {
  CustomDatagridColumn2
} from '../components/CustomDatagrid2';
import {
  createColumnHelper,
  SortingState,
  Updater
} from '@tanstack/react-table';
import useTableState from '../../../hooks/useTableState';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchInput from '../components/SearchInput';
import api, { getErrorMessage } from '../../../utils/api';
import {
  TrafficLightMapPointDTO,
  TrafficLightStatus
} from '../../../models/owns/trafficLight';

const HIERARCHY_ZERO_PAGE_SIZE = 40;
const ALL_FILTER_VALUE = 'ALL';
const trafficLightStatusOptions: TrafficLightStatus[] = [
  'HEALTHY',
  'MAINTENANCE_DUE_SOON',
  'MAINTENANCE_OVERDUE',
  'NEEDS_REPAIR',
  'IN_PROGRESS',
  'INACTIVE'
];

const trafficLightMarkerColors: Record<TrafficLightStatus, string> = {
  HEALTHY: '#2e7d32',
  MAINTENANCE_DUE_SOON: '#ed6c02',
  MAINTENANCE_OVERDUE: '#d32f2f',
  NEEDS_REPAIR: '#8e24aa',
  IN_PROGRESS: '#0288d1',
  INACTIVE: '#757575'
};

const toReadableLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : '';

const getTrafficLightMarkerColor = (status: TrafficLightStatus) =>
  trafficLightMarkerColors[status] ?? '#757575';

function Locations() {
  const { t }: { t: any } = useTranslation();
  const [currentTab, setCurrentTab] = useState<string>('list');
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { apiKey } = googleMapsConfig;

  const { locationsHierarchy, locations, loadingGet } = useSelector(
    (state) => state.locations
  );
  const [deployedLocations, setDeployedLocations] = useState<
    { id: number; hierarchy: number[] }[]
  >([
    {
      id: 0,
      hierarchy: []
    }
  ]);

  const { exportEntity, loadingExport } = useExport();
  const tabs = [
    { value: 'list', label: t('list_view') },
    ...(apiKey
      ? [
          { value: 'map', label: t('map_view') },
          { value: 'trafficLightMap', label: t('traffic_light_map') }
        ]
      : [])
  ];
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const { setTitle } = useContext(TitleContext);
  const { locationId } = useParams();
  const { uploadFiles } = useContext(CompanySettingsContext);
  const {
    hasViewPermission,
    hasViewOtherPermission,
    hasEditPermission,
    hasCreatePermission,
    hasDeletePermission,
    hasFeature
  } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const navigate = useNavigate();
  const [pageable, setPageable] = useState<Pageable>({
    page: 0,
    size: HIERARCHY_ZERO_PAGE_SIZE
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trafficLightMapPoints, setTrafficLightMapPoints] = useState<
    TrafficLightMapPointDTO[]
  >([]);
  const [loadingTrafficLightMap, setLoadingTrafficLightMap] =
    useState<boolean>(false);
  const [trafficLightStatusFilter, setTrafficLightStatusFilter] =
    useState<string>(ALL_FILTER_VALUE);
  const [trafficLightDistrictFilter, setTrafficLightDistrictFilter] =
    useState<string>(ALL_FILTER_VALUE);

  // View type state
  const [hierarchySorting, setHierarchySorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subRowsMap, setSubRowsMap] = useState<Record<number, LocationRow[]>>(
    {}
  );

  // Field mapping for sorting
  const fieldMapping: Record<string, string> = {
    customId: 'customId',
    name: 'name',
    address: 'address',
    createdAt: 'createdAt'
  };

  // Table state for column state persistence
  const tableState = useTableState({
    prefix: 'locations',
    fieldMapping,
    initialPagination: { pageIndex: 0, pageSize: HIERARCHY_ZERO_PAGE_SIZE }
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleOpenUpdate = () => {
    setOpenUpdateModal(true);
  };
  const onOpenDeleteDialog = () => {
    setOpenDelete(true);
  };

  const changeCurrentLocation = (id: number) => {
    setCurrentLocation(locations.find((location) => location.id === id));
  };
  const handleDelete = (id: number) => {
    handleCloseDetails();
    dispatch(deleteLocation(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const onCreationSuccess = () => {
    setOpenAddModal(false);
    showSnackBar(t('location_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('location_create_failure')), 'error');
  const onEditSuccess = () => {
    setOpenUpdateModal(false);
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t('location_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('location_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('location_delete_failure'), 'error');

  const handleOpenDetails = (id: number) => {
    const foundLocation = locations.find((location) => location.id === id);
    if (foundLocation) {
      setCurrentLocation(foundLocation);
      window.history.replaceState(null, 'Location details', getLocationUrl(id));
      setOpenDrawer(true);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(null, 'Location', `/app/locations`);
    setOpenDrawer(false);
  };
  useEffect(() => {
    setTitle(t('locations'));
    if (hasViewPermission(PermissionEntity.LOCATIONS)) {
      dispatch(getLocations());
    }
  }, []);

  useEffect(() => {
    if (hasViewPermission(PermissionEntity.LOCATIONS)) {
      handleReset(false);
      dispatch(getLocationChildren(0, [], pageable));
    }
  }, [pageable]);

  const handleToggleExpand = async (row: LocationRow) => {
    const isExpanded = expanded[row.id];

    if (!isExpanded) {
      // Check if we already have children for this row in the Redux store
      const hasChildrenLoaded = locationsHierarchy.some(
        (l) => l.parentLocation?.id === row.id
      );

      if (!hasChildrenLoaded && row.hasChildren) {
        // Set temporary loading row
        const loadingRow: LocationRow = {
          id: `loading-${row.id}`,
          name: t('loading_locations', { name: row.name, id: row.id }),
          hierarchy: [...(row.hierarchy || []), row.id]
        } as unknown as LocationRow;

        setSubRowsMap((prev) => ({ ...prev, [row.id]: [loadingRow] }));

        // Fetch the children
        await dispatch(
          getLocationChildren(row.id, row.hierarchy || [], pageable)
        );
        setDeployedLocations((prevState) => [...prevState, row]);

        // Clean up the loading row once the fetch is complete
        setSubRowsMap((prev) => {
          const newMap = { ...prev };
          delete newMap[row.id];
          return newMap;
        });
      }
    }

    // Toggle expand/collapse state
    setExpanded((prev) => ({ ...prev, [row.id]: !isExpanded }));
  };

  useEffect(() => {
    if (locations?.length && locationId && isNumeric(locationId)) {
      handleOpenDetails(Number(locationId));
    }
  }, [locations]);

  const loadTrafficLightMapPoints = React.useCallback(async () => {
    if (!hasViewPermission(PermissionEntity.LOCATIONS)) {
      return;
    }

    setLoadingTrafficLightMap(true);
    try {
      const response = await api.get<TrafficLightMapPointDTO[]>(
        '/traffic-light-points/map'
      );
      setTrafficLightMapPoints(response);
    } catch (err) {
      showSnackBar(
        getErrorMessage(err, 'Failed to load traffic light map'),
        'error'
      );
    } finally {
      setLoadingTrafficLightMap(false);
    }
  }, [hasViewPermission, showSnackBar]);

  useEffect(() => {
    if (
      currentTab === 'trafficLightMap' &&
      trafficLightMapPoints.length === 0 &&
      !loadingTrafficLightMap
    ) {
      loadTrafficLightMapPoints();
    }
  }, [
    currentTab,
    loadTrafficLightMapPoints,
    loadingTrafficLightMap,
    trafficLightMapPoints.length
  ]);

  const formatValues = (values) => {
    const newValues = { ...values };
    newValues.customers = formatSelectMultiple(newValues.customers);
    newValues.vendors = formatSelectMultiple(newValues.vendors);
    newValues.workers = formatSelectMultiple(newValues.workers);
    newValues.teams = formatSelectMultiple(newValues.teams);
    newValues.parentLocation = formatSelect(newValues.parentLocation);
    newValues.longitude = newValues.coordinates?.lng;
    newValues.latitude = newValues.coordinates?.lat;
    return newValues;
  };

  const columnHelper = createColumnHelper<Location | LocationRow>();

  const columns: CustomDatagridColumn2<Location | LocationRow>[] = [
    columnHelper.display({
      id: 'expander',
      header: '',
      meta: { enableReordering: false },
      cell: ({ row }) => {
        const isExpanded = expanded[row.original.id];
        const hasSubRows =
          (row.original as LocationRow).hasChildren ||
          subRowsMap[row.original.id]?.length > 0;

        if (!hasSubRows) {
          return <Box sx={{ width: 24 }} />;
        }

        return (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand(row.original as LocationRow);
            }}
            sx={{ padding: 0.5 }}
          >
            {isExpanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        );
      },
      size: 50
    }),
    columnHelper.accessor('customId', {
      id: 'customId',
      header: () => t('id'),
      cell: (info) => info.getValue(),
      size: 100
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: () => t('name'),
      cell: (info) => (
        <Box
          sx={{
            py: 1,
            fontWeight: 'bold',
            ml: (info.row.depth || 0) * 24
          }}
        >
          {info.getValue()}
        </Box>
      ),
      size: 200
    }),
    columnHelper.accessor('address', {
      id: 'address',
      header: () => t('address'),
      cell: (info) => info.getValue() || '',
      size: 200
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: () => t('created_at'),
      cell: (info) => getFormattedDate(info.getValue()),
      size: 140
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => {
        const location = row.original;
        let actions = [];
        if (hasEditPermission(PermissionEntity.LOCATIONS, location)) {
          actions.push(
            <IconButton
              key="edit"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                changeCurrentLocation(Number(location.id));
                handleOpenUpdate();
              }}
            >
              <EditTwoToneIcon fontSize="small" color="primary" />
            </IconButton>
          );
        }
        if (hasDeletePermission(PermissionEntity.LOCATIONS, location)) {
          actions.push(
            <IconButton
              key="delete"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                changeCurrentLocation(Number(location.id));
                setOpenDelete(true);
              }}
            >
              <DeleteTwoToneIcon fontSize="small" color="error" />
            </IconButton>
          );
        }
        return (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        );
      },
      size: 120
    })
  ];
  const fields: Array<IField> = [
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('enter_location_name'),
      required: true
    },
    {
      name: 'address',
      type: 'text',
      label: t('address'),
      placeholder: 'Casa, Maroc',
      required: true
    },
    {
      name: 'parentLocation',
      type: 'select',
      type2: 'parentLocation',
      label: t('parent_location'),
      placeholder: t('select_location')
    },
    {
      name: 'workers',
      multiple: true,
      type: 'select',
      type2: 'user',
      label: t('workers'),
      placeholder: t('select_workers')
    },
    {
      name: 'teams',
      multiple: true,
      type: 'select',
      type2: 'team',
      label: t('teams'),
      placeholder: 'Select teams'
    },
    {
      name: 'vendors',
      multiple: true,
      type: 'select',
      type2: 'vendor',
      label: t('vendors'),
      placeholder: 'Select vendors'
    },
    {
      name: 'customers',
      multiple: true,
      type: 'select',
      type2: 'customer',
      label: t('customers'),
      placeholder: 'Select customers'
    },
    ...(apiKey
      ? ([
          {
            name: 'mapSwitch',
            type: 'checkbox',
            label: t('put_location_in_map'),
            relatedFields: [
              { field: 'mapTitle', value: false, hide: true },
              { field: 'coordinates', value: false, hide: true }
            ]
          },
          {
            name: 'mapTitle',
            type: 'titleGroupField',
            label: t('map_coordinates')
          },
          {
            name: 'coordinates',
            type: 'coordinates',
            label: t('map_coordinates')
          }
        ] as IField[])
      : []),
    {
      name: 'image',
      type: 'file',
      fileType: 'image',
      label: t('image')
    },
    {
      name: 'files',
      type: 'file',
      multiple: true,
      label: t('files'),
      fileType: 'file'
    }
  ];

  const getEditFields = () => {
    const fieldsClone = [...fields];
    return fieldsClone;
  };
  const handleReset = (callApi: boolean) => {
    dispatch(resetLocationsHierarchy(pageable, callApi));
  };
  const shape = {
    name: Yup.string().required(t('required_location_name')),
    address: Yup.string().required(t('required_location_address')).nullable()
  };

  const renderLocationAddModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openAddModal}
      onClose={() => setOpenAddModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('add_location')}
        </Typography>
        <Typography variant="subtitle2">
          {t('add_location_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('add')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              try {
                const uploadedFiles = await uploadFiles(
                  formattedValues.files,
                  formattedValues.image
                );

                const imageAndFiles = getImageAndFiles(uploadedFiles);
                formattedValues = {
                  ...formattedValues,
                  image: imageAndFiles.image,
                  files: imageAndFiles.files
                };

                await dispatch(addLocation(formattedValues));
                onCreationSuccess();
                deployedLocations.forEach((deployedLocation) =>
                  dispatch(
                    getLocationChildren(
                      deployedLocation.id,
                      deployedLocation.hierarchy,
                      pageable
                    )
                  )
                );
              } catch (err) {
                onCreationFailure(err);
                throw err;
              }
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  const renderMenu = () => (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={openMenu}
      onClose={handleCloseMenu}
      MenuListProps={{
        'aria-labelledby': 'basic-button'
      }}
    >
      {hasViewOtherPermission(PermissionEntity.LOCATIONS) && (
        <MenuItem
          disabled={loadingExport['locations']}
          onClick={async () => {
            try {
              await exportEntity('locations');
            } catch (error) {
              showSnackBar(t('Export failed'), 'error');
            }
          }}
        >
          <Stack spacing={2} direction="row">
            {loadingExport['locations'] && <CircularProgress size="1rem" />}
            <Typography>{t('to_export')}</Typography>
          </Stack>
        </MenuItem>
      )}
    </Menu>
  );
  const renderLocationUpdateModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openUpdateModal}
      onClose={() => setOpenUpdateModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('edit_location')}
        </Typography>
        <Typography variant="subtitle2">
          {t('edit_location_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getEditFields()}
            validation={Yup.object().shape(shape)}
            submitText={t('save')}
            values={{
              ...currentLocation,
              title: currentLocation?.name,
              workers: currentLocation?.workers.map((worker) => {
                return {
                  label: `${worker.firstName} ${worker.lastName}`,
                  value: worker.id
                };
              }),
              teams: currentLocation?.teams.map((team) => {
                return {
                  label: team.name,
                  value: team.id
                };
              }),
              vendors: currentLocation?.vendors.map((vendor) => {
                return {
                  label: vendor.companyName,
                  value: vendor.id
                };
              }),
              customers: currentLocation?.customers.map((customer) => {
                return {
                  label: customer.name,
                  value: customer.id
                };
              }),
              coordinates: currentLocation?.longitude
                ? {
                    lng: currentLocation.longitude,
                    lat: currentLocation.latitude
                  }
                : null,
              parentLocation: currentLocation?.parentLocation
                ? {
                    label: currentLocation.parentLocation.name,
                    value: currentLocation.parentLocation.id
                  }
                : null
            }}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              try {
                const imageAndFiles = await handleFileUpload(
                  {
                    files: formattedValues.files,
                    image: formattedValues.image
                  },
                  uploadFiles
                );

                formattedValues = {
                  ...formattedValues,
                  image: imageAndFiles.image,
                  files: imageAndFiles.files
                };

                await dispatch(
                  editLocation(currentLocation.id, formattedValues)
                );
                await onEditSuccess();
              } catch (err) {
                onEditFailure(err);
                throw err;
              }
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  // Flatten hierarchy based on expanded state
  const getHierarchicalData = (
    flatList: LocationRow[],
    expanded: Record<string, boolean>,
    subRowsMap: Record<number, LocationRow[]>,
    parentId: number | null = null,
    depth: number = 0
  ): (LocationRow & { depth: number })[] => {
    let result: (LocationRow & { depth: number })[] = [];

    // 1. Find the children of the current parent
    const nodes = flatList.filter((item) => {
      if (parentId === null) {
        return !item.parentLocation; // Root nodes have no parent
      }
      return item.parentLocation?.id === parentId; // Child nodes
    });

    for (const node of nodes) {
      // 2. Add the current node
      result.push({ ...node, depth });

      // 3. If expanded, add its children right below it
      if (expanded[node.id]) {
        const children = getHierarchicalData(
          flatList,
          expanded,
          subRowsMap,
          node.id,
          depth + 1
        );

        if (children.length > 0) {
          result = [...result, ...children];
        } else if (subRowsMap[node.id]) {
          // Render the temporary loading row if fetching is in progress
          result.push({ ...subRowsMap[node.id][0], depth: depth + 1 });
        }
      }
    }

    return result;
  };

  // Prepare data for the table based on expanded state
  const tableData = getHierarchicalData(
    locationsHierarchy,
    expanded,
    subRowsMap
  );

  // Filter table data based on search query
  const filteredTableData = searchQuery.trim()
    ? locations.filter(
        (row) =>
          row.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.customId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tableData;

  const districtOptions = Array.from(
    new Set(
      trafficLightMapPoints
        .map((point) => point.district?.trim())
        .filter((district): district is string => Boolean(district))
    )
  ).sort((left, right) => left.localeCompare(right));

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTrafficLightMapPoints = trafficLightMapPoints.filter((point) => {
    const matchesStatus =
      trafficLightStatusFilter === ALL_FILTER_VALUE ||
      point.currentStatus === trafficLightStatusFilter;
    const matchesDistrict =
      trafficLightDistrictFilter === ALL_FILTER_VALUE ||
      point.district === trafficLightDistrictFilter;
    const matchesSearch =
      !normalizedSearchQuery ||
      [
        point.name,
        point.address,
        point.poleCode,
        point.district,
        point.ward
      ].some((value) =>
        value?.toLowerCase().includes(normalizedSearchQuery)
      );

    return matchesStatus && matchesDistrict && matchesSearch;
  });

  const trafficLightMapMarkers = filteredTrafficLightMapPoints
    .filter(
      (point) =>
        point.latitude !== null &&
        point.latitude !== undefined &&
        point.longitude !== null &&
        point.longitude !== undefined
    )
    .map((point) => ({
      id: point.atlasLocationId,
      title: point.name || point.poleCode,
      subtitle: `${point.poleCode} - ${toReadableLabel(point.currentStatus)}`,
      address: point.address,
      coordinates: {
        lat: point.latitude,
        lng: point.longitude
      },
      href: `/app/locations/${point.atlasLocationId}`,
      markerColor: getTrafficLightMarkerColor(point.currentStatus)
    }));

  // Handle pagination change for hierarchy view
  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPageable((prev) => ({
      ...prev,
      page: newPagination.pageIndex,
      size: newPagination.pageSize
    }));
  };

  // Handle sorting change for hierarchy view
  const handleSortingChange = (newSorting: Updater<SortingState>) => {
    const resolvedSorting: SortingState =
      typeof newSorting === 'function'
        ? newSorting(hierarchySorting)
        : newSorting;
    setHierarchySorting(resolvedSorting);
    const sortParams =
      resolvedSorting.length > 0
        ? resolvedSorting.map(
            (sort) =>
              `${fieldMapping[sort.id] || sort.id},${
                sort.desc ? 'desc' : 'asc'
              }` as Sort
          )
        : [];
    setPageable((prev) => ({
      ...prev,
      sort: sortParams.length > 0 ? [...sortParams] : undefined
    }));
  };

  if (hasViewPermission(PermissionEntity.LOCATIONS))
    return (
      <>
        <Helmet>
          <title>{t('locations')}</title>
        </Helmet>
        <Box justifyContent="center" alignItems="stretch" paddingX={4}>
          <Box
            my={1}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {tabs.length > 1 ? (
              <Tabs
                onChange={handleTabsChange}
                value={currentTab}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
            ) : (
              <Box />
            )}
            <Stack direction={'row'} alignItems="center" spacing={1}>
              <SearchInput onChange={(e) => setSearchQuery(e.target.value)} />
              <IconButton
                onClick={() => {
                  if (currentTab === 'trafficLightMap') {
                    loadTrafficLightMapPoints();
                    return;
                  }
                  handleReset(true);
                }}
                color="primary"
              >
                <ReplayTwoToneIcon />
              </IconButton>
              <IconButton onClick={handleOpenMenu} color="primary">
                <MoreVertTwoToneIcon />
              </IconButton>
              {hasCreatePermission(PermissionEntity.LOCATIONS) && (
                <SplitButton
                  onMainClick={() => setOpenAddModal(true)}
                  startIcon={<AddTwoToneIcon />}
                  sx={{ mx: 6, my: 1 }}
                  label={t('location')}
                  menuItems={
                    hasViewPermission(PermissionEntity.SETTINGS) &&
                    hasFeature(PlanFeature.IMPORT_CSV)
                      ? [
                          {
                            label: t('to_import'),
                            onClick: () => navigate('/app/imports/locations')
                          }
                        ]
                      : []
                  }
                />
              )}
            </Stack>
          </Box>
          {currentTab === 'list' && (
            <Card
              sx={{
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ width: '95%' }}>
                <CustomDatagrid2
                  columns={searchQuery?.trim() ? columns.slice(1) : columns}
                  data={filteredTableData}
                  loading={loadingGet}
                  pagination={{
                    pageIndex: pageable.page,
                    pageSize: pageable.size
                  }}
                  hidePagination
                  onPaginationChange={handlePaginationChange}
                  totalRows={locationsHierarchy.length}
                  pageSizeOptions={[10, 25, 50, 100]}
                  sorting={hierarchySorting}
                  onSortingChange={handleSortingChange}
                  columnOrder={tableState.columnOrder}
                  onColumnOrderChange={tableState.setColumnOrder}
                  columnSizing={tableState.columnSizing}
                  onColumnSizingChange={tableState.setColumnSizing}
                  columnVisibility={tableState.columnVisibility}
                  onColumnVisibilityChange={tableState.setColumnVisibility}
                  pinnedColumns={tableState.pinnedColumns}
                  onPinnedColumnsChange={tableState.setPinnedColumns}
                  noRowsMessage={t('noRows.location.message')}
                  noRowsAction={t('noRows.location.action')}
                  onRowClick={(row) => {
                    handleOpenDetails(row.id);
                  }}
                />
              </Box>
            </Card>
          )}
          {currentTab === 'map' && (
            <Card
              sx={{
                p: 2,
                justifyContent: 'center'
              }}
            >
              <Map
                dimensions={{ width: 1000, height: 500 }}
                locations={locations
                  .filter((location) => location.longitude)
                  .map(({ name, longitude, latitude, address, id }) => {
                    return {
                      title: name,
                      coordinates: {
                        lng: longitude,
                        lat: latitude
                      },
                      address,
                      id
                    };
                  })}
                />
            </Card>
          )}
          {currentTab === 'trafficLightMap' && (
            <Stack spacing={2}>
              <Card sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                >
                  <TextField
                    select
                    size="small"
                    label={t('status')}
                    value={trafficLightStatusFilter}
                    onChange={(event) =>
                      setTrafficLightStatusFilter(event.target.value)
                    }
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value={ALL_FILTER_VALUE}>
                      {t('all_statuses')}
                    </MenuItem>
                    {trafficLightStatusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {toReadableLabel(status)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label={t('district')}
                    value={trafficLightDistrictFilter}
                    onChange={(event) =>
                      setTrafficLightDistrictFilter(event.target.value)
                    }
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value={ALL_FILTER_VALUE}>
                      {t('all_districts')}
                    </MenuItem>
                    {districtOptions.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="subtitle2" color="text.secondary">
                    {filteredTrafficLightMapPoints.length} {t('traffic_light_point')}
                  </Typography>
                </Stack>
              </Card>
              <Card
                sx={{
                  p: 2,
                  justifyContent: 'center',
                  minHeight: 540
                }}
              >
                {loadingTrafficLightMap ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight={500}
                  >
                    <CircularProgress />
                  </Box>
                ) : trafficLightMapMarkers.length > 0 ? (
                  <Map
                    dimensions={{ width: 1000, height: 500 }}
                    locations={trafficLightMapMarkers}
                  />
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight={500}
                    textAlign="center"
                  >
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('no_traffic_light_points')}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Stack>
          )}
        </Box>
        {renderLocationAddModal()}
        {renderLocationUpdateModal()}
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={handleCloseDetails}
          PaperProps={{
            sx: { width: { xs: '90%', sm: '70%', md: '50%' } }
          }}
        >
          <LocationDetails
            location={currentLocation}
            handleOpenUpdate={handleOpenUpdate}
            handleOpenDelete={onOpenDeleteDialog}
          />
        </Drawer>
        <ConfirmDialog
          open={openDelete}
          onCancel={() => {
            setOpenDelete(false);
          }}
          onConfirm={() => handleDelete(currentLocation?.id)}
          confirmText={t('to_delete')}
          question={t('confirm_delete_location')}
        />
        {renderMenu()}
      </>
    );
  else return <PermissionErrorMessage message={'no_access_location'} />;
}

export default Locations;
