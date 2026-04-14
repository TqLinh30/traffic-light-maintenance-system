# Performance Notes

## Current Observations
- `Location` already stores coordinates directly, which is useful for point map loading.
- Current location map is a simple Google Maps marker layer; it will not scale well for dense status rendering without a more focused data shape.
- `AssetRepository`, `LocationRepository`, `RequestRepository`, and `WorkOrderRepository` provide direct lookup methods, but there is no QR-specific lookup path yet.
- Existing public request portal flow fetches portal metadata first, then submits the request; the QR flow will need a similarly lean public bootstrap call.

## Likely Performance Priorities
- Fast `qrPublicCode` resolution
- Fast point lookup by `poleCode`
- Efficient point-status list query for map rendering
- Avoid N+1 request and work order lookups when rendering map status summaries
- Keep public QR landing bootstrap payload small

## Recommended Future Indexes
- `qr_public_code`
- `traffic_light_point_id`
- `atlas_location_id`
- `pole_code`
- `location_id`
- `asset_id`
- derived status query support fields as needed after Phase 1 design

## Phase 1 Decisions
- `pole_code` should be company-scoped searchable identity
- `qr_public_code` should be a dedicated indexed lookup key
- status remains derived, so optimization will focus on aggregation queries and summary DTOs rather than write-side denormalization

## Phase 2 Implementation Notes
- Added indexed lookup keys in the initial migration for:
  - `traffic_light_point.atlas_location_id`
  - `traffic_light_point.pole_code`
  - `traffic_light_point.is_active`
  - `traffic_light_point.main_asset_id`
  - `qr_tag.qr_public_code`
  - `qr_tag.traffic_light_point_id`
  - `qr_tag.status`
  - `request.qr_tag_id`
  - `request.pole_code`
  - `request.request_source`
- Public QR bootstrap payload is intentionally compact:
  - point summary
  - derived status
  - active work orders
- Current backend performance caveat:
  - point status derivation currently pulls related work orders through service calls and will need a more explicit summary query before large-scale map rendering in Phase 5 or hardening.

## Phase 3 Frontend Notes
- The public QR frontend uses one resolve request per entry step and one submit request for issue creation.
- The page avoids portal bootstrap overfetch by calling the dedicated QR resolve endpoint directly.
- Success-state persistence is local to the browser for the public confirmation step and does not introduce extra API traffic.

## Phase 4 Frontend Notes
- The request review enhancements reuse the existing request payload and do not add extra API calls.
- Traffic-light request metadata is rendered from the already-fetched request record in both the list and detail drawer.

## Phase 5 Map Notes
- The internal traffic-light map now uses one dedicated summary endpoint:
  - `GET /traffic-light-points/map`
- The frontend reuses one fetched payload for filtering and marker rendering, which avoids per-marker API calls.
- The shared map component remains generic while allowing additive status-colored markers and custom drill-in links.
- Current backend performance caveat:
  - `TrafficLightPointService.getMapPoints(...)` still relies on the existing per-point status derivation path, so large datasets may still hit N+1 work-order lookups until Phase 7 optimization.
- Current frontend performance caveat:
  - there is no clustering or viewport-based loading yet for dense traffic-light point sets.

## Phase 6 PM And History Notes
- The location drawer now makes one additional optional detail request for traffic-light points:
  - `GET /traffic-light-points/location/{locationId}`
- Related PM schedules are resolved through existing `location` and `asset` relations rather than new join tables.
- Current backend performance caveat:
  - PM detail and next-maintenance derivation still call mapper-based next-date calculation per related PM, which is acceptable for the current small point-detail scope but should be revisited in hardening if PM counts grow.
- Current frontend performance caveat:
  - non-traffic-light locations still incur one failed lookup request before the drawer decides no traffic-light tab is needed.

## Phase 7 Optimization Notes
- The internal map summary path no longer performs per-point repository fan-out for its main derived inputs.
- `TrafficLightPointService.getMapPoints(...)` now batches:
  - work orders by point location and optional main asset
  - PM schedules by point location and optional main asset
  - pending-request location ids
- Current residual backend caveat:
  - QR resolve and point-detail reads still use per-point aggregation paths, which is acceptable for single-point requests but should be revisited if those views become high-volume.

## Post-Phase Localization Notes
- Locale bundles remain lazy-loaded, so adding `vi` does not force all translations into the initial bundle.
- The shared frontend language-switch helper reduces repeated `changeLanguage(...)` calls and keeps bundle loading logic centralized.
- The generated `vi` and completed `zh_tw` bundles increase translation asset size on disk, but they are still loaded on demand rather than at first paint.

## Current Risk Areas
- Reusing generic location map payloads for a dense operational map may overfetch.
- Computing traffic-light status in the frontend would create unnecessary API calls and duplicated logic.
- Using asset barcode as a QR lookup would couple public point access to asset internals and internal permission assumptions.

## Guidance
- Keep status derivation server-side.
- Add QR-specific read paths instead of piggybacking on generic search endpoints.
- Prefer one map summary endpoint over multiple per-marker calls.
- Revisit point-status aggregation before building dense map views to avoid N+1 work-order loading.
- Keep the public QR bootstrap payload compact as the route gets reused by mobile scanners in the field.
- Keep internal review enrichment additive so request approval logic remains stable.
- Add clustering or viewport-aware loading only after the first real point-volume baseline is measured.
- Consider a lightweight location-to-traffic-light existence signal or cached lookup if the optional point-detail request becomes noisy in production.
- Keep duplicate-request handling manual until field evidence justifies a safe suppression or warning rule.
- Keep localization switching centralized so future locale additions do not bypass lazy-loading and cause inconsistent UI state.
