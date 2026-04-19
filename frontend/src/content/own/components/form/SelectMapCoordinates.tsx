import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Map from '../Map';

interface SelectMapCoordinatesProps {
  selected?: { lat: number; lng: number } | null;
  address?: string | null;
  onChange: (coordinates: { lat: number; lng: number }) => void;
  onAddressConfirm?: (address: string) => void;
}
export default function SelectMapCoordinates({
  onChange,
  onAddressConfirm,
  selected,
  address
}: SelectMapCoordinatesProps) {
  const { t }: { t: any } = useTranslation();
  const [searchInput, setSearchInput] = useState<string>(address ?? '');
  const [submittedSearchAddress, setSubmittedSearchAddress] = useState<string>(
    address ?? ''
  );
  const [searchRequestId, setSearchRequestId] = useState<number>(0);

  useEffect(() => {
    setSearchInput(address ?? '');
    setSubmittedSearchAddress(address ?? '');
  }, [address]);

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
        searchAddress={submittedSearchAddress}
        searchRequestId={searchRequestId}
        onAddressConfirm={(resolvedAddress) => {
          setSearchInput(resolvedAddress);
          setSubmittedSearchAddress(resolvedAddress);
          onAddressConfirm?.(resolvedAddress);
        }}
        onSelect={onChange}
      />
    </Stack>
  );
}
