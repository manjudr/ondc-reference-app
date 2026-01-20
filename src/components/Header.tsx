
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useConfig } from '../config/ConfigProvider';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { config } = useConfig();
    const [logoError, setLogoError] = useState(false);
    const theme = useTheme();

    if (!config) return null;

    const { header } = config.layout;

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor: header.background,
                color: header.color
            }}
            elevation={0}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, outline: 'none', '&:focus': { outline: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {header.logo && !logoError ? (
                        <Avatar
                            src={header.logo}
                            alt={header.title || "Logo"}
                            variant="rounded"
                            sx={{ width: 40, height: 40, bgcolor: 'transparent' }}
                            imgProps={{
                                onError: () => setLogoError(true)
                            }}
                        />
                    ) : (
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                                backdropFilter: 'blur(4px)',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '1.25rem',
                                border: '1px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {header.title ? header.title.charAt(0).toUpperCase() : 'B'}
                        </Avatar>
                    )}
                    <Box>
                        <Typography variant="h6" noWrap component="div" sx={{ lineHeight: 1.2 }}>
                            {header.title}
                        </Typography>
                        {header.subtitle && (
                            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                {header.subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
