import { RouteObject } from 'react-router';

import Authenticated from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import appRoutes from './app';
import accountRoutes from './account';
import oauthRoutes from './oauth';
import { lazy, Suspense } from 'react';
import SuspenseLoader from '../components/SuspenseLoader';
import Status404 from '../content/pages/Status/Status404';
import { Navigate } from 'react-router-dom';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

const PaymentSuccess = Loader(
  lazy(() => import('../content/pages/Payment/Success'))
);

const RequestPortalPublicPage = Loader(
  lazy(() =>
    import('../content/own/Settings/RequestPortal/PublicPage/RequestPortalPublicPage')
  )
);

const TrafficLightQrPublicPage = Loader(
  lazy(() =>
    import('../content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage')
  )
);

const router: RouteObject[] = [
  {
    path: 'account',
    children: accountRoutes
  },
  { path: 'oauth2', children: oauthRoutes },
  {
    path: 'payment/success',
    element: <PaymentSuccess />
  },
  {
    path: 'request-portal/:uuid',
    element: <RequestPortalPublicPage />
  },
  {
    path: 'traffic-light/:qrPublicCode',
    element: <TrafficLightQrPublicPage />
  },
  {
    path: 'traffic-light/:qrPublicCode/report',
    element: <TrafficLightQrPublicPage />
  },
  {
    path: 'traffic-light/:qrPublicCode/success',
    element: <TrafficLightQrPublicPage />
  },
  {
    path: 'app',
    element: (
      <Authenticated>
        <ExtendedSidebarLayout />
      </Authenticated>
    ),
    children: appRoutes
  },
  {
    path: '',
    element: <Navigate to={'/app/work-orders'} />
  },
  {
    path: '*',
    element: <Status404 />
  }
];

export default router;
