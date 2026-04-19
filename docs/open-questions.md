# Open Questions

## Phase 1 Questions
- Which point fields are mandatory in MVP:
  - `poleCode`
  - `district`
  - `roadName`
  - `intersectionName`
  - `mainAssetId`
  - `maintenanceCycleDays`
- Should `poleCode` be generated internally or imported from external traffic inventory data?
- Should request deduplication be based on:
  - same point
  - same fault type
  - open time window
- Should worker-facing QR access be public, authenticated, or dual-mode?

## Resolved In Phase 1
- MVP will use a dedicated `TrafficLightPoint` entity linked one-to-one to `Location`.
- One point may have multiple QR tags over time; public resolution must use the active one.

## Atlas-Specific Technical Questions
- Is there already any hidden custom field infrastructure that could support traffic-light metadata without immediate schema additions?
- Are there current role or permission assumptions around public request creation that would constrain a QR landing page?

## Resolved Technical Notes
- Existing `CustomField` support is vendor-specific and not suitable for point metadata.
- Existing `FieldConfiguration` support is only a form-configuration surface and not a domain metadata store.
- Dedicated public QR endpoints are now explicitly permitted through `WebSecurityConfig`.

## UX Questions
- Should the first QR landing page allow only issue reporting in Phase 1, or also show active work context for workers?
- Should point detail from QR be read-only for public users?
- Should public QR request flow capture optional scan GPS for audit and fraud detection?

## Phase 2 Follow-Up Questions
- Should the QR landing page expose active work orders to all public users, or only surface them when a worker is authenticated later?
- Do we want a simple duplicate-request warning in the public form before we implement hard backend deduplication?

## Resolved In Phase 3
- The first public QR landing page now shows active work-order context read-only when available.
- Public QR request flow now captures scan GPS on a best-effort basis without blocking submission.

## Phase 3 Follow-Up Questions
- Should public users continue seeing read-only active work-order context, or should that become worker-only in a later authenticated enhancement?
- Do we want a dedicated public point-detail page beyond the inline details section once map and history views exist?

## Resolved In Phase 4
- Existing internal request review screens are sufficient for traffic-light review when enriched with additive request metadata.

## Phase 4 Follow-Up Questions
- Should the request list eventually default-hide some of the new traffic-light columns on smaller screens, or should all triage fields remain visible by default?

## Resolved In Phase 5
- The operational map is implemented as a dedicated tab in the existing locations screen rather than replacing the generic location map.
- Marker drill-in continues to use the existing location detail surface for now.

## Phase 5 Follow-Up Questions
- At what point count should we introduce clustering or viewport-based map loading?
- Should Phase 6 or a later phase introduce a dedicated traffic-light point detail page once PM history is visible?

## Resolved In Phase 6
- PM schedules now influence `nextMaintenanceAt` when a point has related PM data.
- The existing location drawer is sufficient for the first traffic-light point-detail and history surface.

## Phase 6 Follow-Up Questions
- Should non-traffic-light locations expose a cached existence flag to avoid optional 404 detail lookups?
- Should a later phase split recent reactive work from recent preventive work in the point-history panel?

## Resolved In Phase 7
- The traffic-light map summary path now uses batched backend reads for its main derived signals.
- Internal traffic-light endpoints remain authenticated and permission-gated; only QR resolve and QR request create remain public.

## Remaining Follow-Up Questions
- Do we want a lightweight `hasTrafficLightPoint` signal on locations to avoid optional point-detail lookup misses?
- What evidence threshold should trigger a real duplicate-request warning or suppression rule?
- Do we want a native-speaker terminology review pass for the generated `vi` and completed `zh_tw` UI copy before production rollout?
- Which Google Cloud APIs and key restrictions should be enabled for the web `Location` map picker:
  - `Maps JavaScript API`
  - `Geocoding API`
  - the relevant `Places` API support used by the Maps JavaScript `places` library

## Resolved Post-Phase QR Provisioning
- The project stays point-centric:
  - one `TrafficLightPoint` remains anchored to one `Location`
  - `Asset` remains secondary equipment
  - `QrTag` continues to resolve to `TrafficLightPoint`
- Traffic-light locations now use a lightweight `trafficLightEnabled` flag on `Location` only to trigger provisioning.
- New or first-enabled traffic-light locations auto-create:
  - `TrafficLightPoint`
  - default `poleCode`
  - active `QrTag.qrPublicCode`
