import { useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Map from '../Map';

interface SelectMapCoordinatesProps {
  selected?: { lat: number; lng: number } | null;
  selectedHeading?: number | null;
  address?: string | null;
  addressSyncVersion?: number;
  onChange: (coordinates: { lat: number; lng: number }) => void;
  onAddressConfirm?: (address: string) => void;
}
export default function SelectMapCoordinates({
  onChange,
  onAddressConfirm,
  selected,
  selectedHeading,
  address,
  addressSyncVersion = 0
}: SelectMapCoordinatesProps) {
  const { t }: { t: any } = useTranslation();
  const [searchInput, setSearchInput] = useState<string>(address ?? '');
  const [submittedSearchAddress, setSubmittedSearchAddress] = useState<string>(
    address ?? ''
  );
  const [searchRequestId, setSearchRequestId] = useState<number>(0);
  const skipNextAddressSyncRef = useRef<boolean>(false);
  const previousAddressSyncVersionRef = useRef<number>(addressSyncVersion);

  useEffect(() => {
    setSearchInput(address ?? '');
    if (addressSyncVersion !== previousAddressSyncVersionRef.current) {
      previousAddressSyncVersionRef.current = addressSyncVersion;
      skipNextAddressSyncRef.current = true;
    }
    if (skipNextAddressSyncRef.current) {
      skipNextAddressSyncRef.current = false;
      return;
    }
    setSubmittedSearchAddress(address ?? '');
  }, [address, addressSyncVersion]);

  const handleSearch = () => {
    const normalizedQuery = searchInput.trim();
    if (!normalizedQuery) {
      return;
    }
    setSubmittedSearchAddress(normalizedQuery);
    setSearchRequestId((current) => current + 1);
  };

  return (
    <Stack spacing={2}>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            label={t('search')}
            placeholder={`${t('search')} ${String(t('address')).toLowerCase()}`}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button variant="contained" type="submit">
            {t('search')}
          </Button>
        </Stack>
      </Box>
      <Map
        dimensions={{ width: '100%', height: 420 }}
        select={true}
        selected={selected}
        selectedHeading={selectedHeading}
        searchAddress={submittedSearchAddress}
        searchRequestId={searchRequestId}
        onAddressConfirm={(resolvedAddress) => {
          skipNextAddressSyncRef.current = true;
          setSearchInput(resolvedAddress);
          onAddressConfirm?.(resolvedAddress);
        }}
        onSelect={onChange}
      />
    </Stack>
  );
}
