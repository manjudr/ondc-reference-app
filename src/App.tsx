import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useConfig } from './config/ConfigProvider';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import Layout from './components/Layout';

import DiscoveryView from './views/DiscoveryView';

import CatalogPublishView from './views/CatalogPublishView';

// Placeholder Components (We will implement real ones in Phase 3)
// const DiscoveryView = () => <Box p={4}><Typography variant="h4">Generic Discovery View</Typography></Box>; // REPLACED
// const CatalogPublishView = () => <Box p={4}><Typography variant="h4">Generic Catalog Publish View</Typography></Box>; // REPLACED

// Component to handle tenant context setting and validation
const TenantRoute = () => {
  const { endpoint } = useParams();
  const { config } = useConfig();

  if (!config || config.endpoint !== `/${endpoint}`) {
    // If loaded config doesn't match URL, something is wrong or in transition.
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{config.app.title}</title>
        <link rel="icon" type="image/svg+xml" href={config.app.favicon} />
      </Helmet>
      <Layout />
    </>
  );
};

export default function App() {
  const { config, isLoading } = useConfig();

  if (isLoading) return null; // ConfigProvider handles loading UI.

  return (
    <Routes>
      {/* Root Redirect */}
      <Route path="/" element={<Navigate to={(config?.endpoint || '').replace(/^\//, '')} replace />} />

      {/* Tenant Routes */}
      <Route path="/:endpoint" element={<TenantRoute />}>
        {/* 
                    Dynamic Routes Generation:
                    Iterate through config.views and create routes.
                 */}
        {config && Object.entries(config.views).map(([key, viewConfig]: [string, any]) => {
          const Element = viewConfig.type === 'search' ? DiscoveryView : CatalogPublishView;
          return (
            <Route key={key} path={key} element={<Element />} />
          );
        })}

        {/* Default redirect for tenant root (e.g. /retail -> /retail/discovery) */}
        <Route index element={<Navigate to="discovery" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Box p={4}>Page Not Found</Box>} />
    </Routes>
  );
}
