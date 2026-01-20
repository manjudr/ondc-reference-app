
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
  Typography,
  Avatar
} from '@mui/material';
import { useConfig } from '../config/ConfigProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from '@mui/icons-material';
import type { SidebarItem } from '../config/types';

interface SidebarProps {
  mobileOpen: boolean;
  desktopOpen: boolean;
  onMobileClose: () => void;
  width: number;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, desktopOpen, onMobileClose, width }) => {
  const { config } = useConfig();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  if (!config) return null;

  const { sidebar } = config.layout;
  const primaryColor = config.theme.palette.primary.main;
  const fontFamily = config.theme.typography.fontFamily;

  // Helper to dynamically load icons
  const renderIcon = (iconName: string) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.HelpOutline;
    return <IconComponent />;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile Header in Drawer */}
      {isMobile && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          {config.app.logo ? (
            <Avatar src={config.app.logo} alt={config.app.title || "Logo"} variant="rounded" sx={{ width: 32, height: 32 }}>
              {config.app.title ? config.app.title.charAt(0).toUpperCase() : 'B'}
            </Avatar>
          ) : (
            <Avatar
              variant="rounded"
              sx={{
                width: 32,
                height: 32,
                bgcolor: primaryColor,
                color: config.theme.palette.primary.contrastText,
                fontWeight: 700,
                fontSize: '1rem',
                fontFamily: fontFamily
              }}
            >
              {config.app.title ? config.app.title.charAt(0).toUpperCase() : 'B'}
            </Avatar>
          )}
          <Typography variant="h6" sx={{ fontFamily: fontFamily, fontWeight: 700 }}>
            {config.app.title}
          </Typography>
        </Box>
      )}

      <Box sx={{ overflow: 'auto', mt: isMobile ? 0 : 8, px: 2, pb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            pl: 3,
            mb: 1,
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: fontFamily,
            opacity: 0.8
          }}
        >
          {sidebar.sectionTitle || 'Networks'}
        </Typography>
        <List>
          {sidebar.items.map((item: SidebarItem) => {
            const isActive = location.pathname.includes(item.id) ||
              item.routes?.some(r => location.pathname.includes(r));

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1, display: 'block' }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    const route = item.routes && item.routes.length > 0 ? item.routes[0] : item.id;
                    const targetPath = `${config.endpoint}/${route}`;
                    navigate(targetPath);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none',
                    border: 'none',
                    '&:focus': {
                      outline: 'none'
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(primaryColor, 0.1),
                      color: primaryColor,
                      '&:hover': {
                        bgcolor: alpha(primaryColor, 0.15),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '60%',
                        width: 4,
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: primaryColor,
                      }
                    },
                    '&:hover': {
                      bgcolor: alpha(primaryColor, 0.05),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? primaryColor : alpha(sidebar.color, 0.7),
                      minWidth: 40,
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {renderIcon(item.icon)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontFamily: fontFamily,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.95rem',
                      sx: { color: isActive ? primaryColor : sidebar.color }
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      display: 'block',
                      fontFamily: fontFamily,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      mt: 0.25,
                      sx: { color: isActive ? alpha(primaryColor, 0.9) : alpha(sidebar.color, 0.6) }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer / Version info could go here */}
      <Box sx={{ mt: 'auto', p: 3, opacity: 0.5 }}>
        <Typography variant="caption" display="block" align="center" sx={{ fontFamily: fontFamily }}>
          {sidebar.footer || config.network.domain || 'Beckn Network'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: desktopOpen ? width : 0 }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
            bgcolor: sidebar.background,
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
            bgcolor: sidebar.background,
            borderRight: '1px solid',
            borderColor: 'divider',
            borderStyle: 'dashed' // A subtle touch for "elegant" feel
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
