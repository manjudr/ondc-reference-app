
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { AppConfig, ClientConfig } from './types';
import { validateConfig } from './validator';
import { CircularProgress, Box, Typography, Alert, AlertTitle } from '@mui/material';

interface ConfigContextType {
    config: ClientConfig | null;
    isLoading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
    config: null,
    isLoading: true,
    error: null,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [fullConfig, setFullConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/config.json');
                if (!response.ok) {
                    throw new Error(`Failed to load config: ${response.statusText}`);
                }
                const jsonData = await response.json();

                // Validate Schema
                const validation = validateConfig(jsonData);
                if (!validation.isValid) {
                    throw new Error(`Invalid Configuration:\n${validation.errors?.join('\n')}`);
                }

                setFullConfig(validation.config as AppConfig);
            } catch (err: any) {
                setError(err.message || 'Unknown error loading configuration');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const activeConfig = useMemo(() => {
        if (!fullConfig) return null;

        const path = location.pathname;
        let found = fullConfig.find((c: ClientConfig) => path.startsWith(c.endpoint));

        if (!found) {
            if (path === '/' || path === '') {
                found = fullConfig[0];
            } else {
                found = fullConfig[0];
            }
        }
        return found;
    }, [fullConfig, location.pathname]);

    const contextValue = useMemo(() => ({
        config: activeConfig,
        isLoading,
        error
    }), [activeConfig, isLoading, error]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Alert severity="error">
                    <AlertTitle>Configuration Error</AlertTitle>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {error}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    return (
        <ConfigContext.Provider value={contextValue}>
            {children}
        </ConfigContext.Provider>
    );
};
