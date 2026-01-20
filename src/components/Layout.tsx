
import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useConfig } from '../config/ConfigProvider';

const drawerWidth = 280;

const Layout: React.FC = () => {
    const { config } = useConfig();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(true);

    if (!config) return null;

    // Create MUI theme from config.theme
    const theme = createTheme({
        palette: {
            mode: config.theme.mode || 'light',
            primary: config.theme.palette.primary,
            background: {
                default: config.theme.palette.background.default,
                paper: config.theme.palette.background.paper,
            },
            text: config.theme.palette.text,
            action: config.theme.palette.action,
        },
        typography: config.theme.typography,
        shape: config.theme.shape,
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: config.layout.header.background,
                        color: config.layout.header.color,
                        transition: 'all 0.3s ease'
                    }
                }
            }
        }
    });

    // Use a hook to detect screen size for the toggle logic
    // We cannot use standard hooks conditionally, so we use useMediaQuery inside the component
    // relying on the default theme or the one we just created?
    // The theme object we created above isn't available to the useMediaQuery hook *outside* ThemeProvider.
    // However, useTheme provided by MUI context inside ThemeProvider would work, 
    // but we are creating the theme HERE.
    // Solution: Move the LayoutContent inside a child component or just trust standard breakpoints 
    // or assume 'md' is 900px.
    // Re-using a generic theme for media query or matching standard MUI breakpoints manually.
    // For simplicity, let's create a wrapper or just use 'window.innerWidth' inside handler 
    // OR -- easier: just toggle BOTH states? 
    // No, that's messy.
    // Best practice: The toggle handler checks the current window width.

    const handleDrawerToggle = () => {
        if (window.innerWidth >= 900) { // Standard MUI 'md' breakpoint
            setDesktopOpen(!desktopOpen);
        } else {
            setMobileOpen(!mobileOpen);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                <Header onMenuClick={handleDrawerToggle} />

                <Sidebar
                    mobileOpen={mobileOpen}
                    desktopOpen={desktopOpen}
                    onMobileClose={() => setMobileOpen(false)}
                    width={drawerWidth}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        // Transitions matching the sidebar animation
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        // Dynamic width based on sidebar state
                        width: { xs: '100%', md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                        mt: 8,
                        minHeight: '100vh',
                        overflowX: 'hidden'
                    }}
                >

                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
