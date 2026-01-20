import React, { useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Chip,
    Stack,
    Button,
    Card,
    CardContent,
    CardMedia,
    Rating,
    CircularProgress,
    Grid,
    Paper,
    Slider,
    alpha,
    InputBase
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useConfig } from '../config/ConfigProvider';
import type { DiscoveryViewConfig } from '../config/types';

// Extracted ResultCard component for better organization
const ResultCard: React.FC<{
    item: any;
    config: any;
    viewConfig: DiscoveryViewConfig;
}> = ({ item, config, viewConfig }) => {
    const primaryColor = config.theme.palette.primary.main;
    const fontFamily = config.theme.typography.fontFamily;

    return (
        <Card
            elevation={0}
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: `${config.theme.shape.borderRadius}px`,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(primaryColor, 0.08),
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: config.theme.palette.background.paper,
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 40px ${alpha(primaryColor, 0.15)}, 0 0 0 1px ${alpha(primaryColor, 0.1)}`,
                    borderColor: alpha(primaryColor, 0.2),
                    '& .card-image-overlay': {
                        opacity: 0.15
                    },
                    '& .card-action-button': {
                        transform: 'translateX(0)',
                        opacity: 1
                    }
                }
            }}
        >
            {/* Image Section with Overlay */}
            <Box
                sx={{
                    position: 'relative',
                    pt: '66.67%', // 3:2 aspect ratio
                    overflow: 'hidden',
                    bgcolor: alpha(primaryColor, 0.03)
                }}
            >
                {/* Gradient Overlay */}
                <Box
                    className="card-image-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(180deg, transparent 0%, ${alpha(primaryColor, 0)} 50%, ${alpha(primaryColor, 0.05)} 100%)`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 1
                    }}
                />

                <CardMedia
                    image={item.image}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Category Badge */}
                <Chip
                    label={item.category}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        color: primaryColor,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                        border: `1px solid ${alpha(primaryColor, 0.15)}`,
                        boxShadow: `0 4px 12px ${alpha(primaryColor, 0.1)}`,
                        zIndex: 2,
                        letterSpacing: '0.03em',
                        fontFamily: fontFamily
                    }}
                />

                {/* Rating Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        borderRadius: `${config.theme.shape.buttonRadius}px`,
                        px: 1.5,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        zIndex: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <Rating
                        value={1}
                        max={1}
                        size="small"
                        readOnly
                        sx={{
                            color: '#FFD700',
                            fontSize: '1rem'
                        }}
                    />
                    <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                            fontFamily: fontFamily,
                            fontSize: '0.8rem'
                        }}
                    >
                        {item.rating}
                    </Typography>
                </Box>
            </Box>

            {/* Content Section */}
            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    gap: 2
                }}
            >
                {/* Product Name */}
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        fontFamily: fontFamily,
                        fontSize: '1.1rem',
                        lineHeight: 1.4,
                        color: config.theme.palette.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.8em',
                        mb: 0.5
                    }}
                >
                    {item.name}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: fontFamily,
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        color: config.theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.8em',
                        mb: 1
                    }}
                >
                    {item.description}
                </Typography>

                {/* Divider */}
                <Box
                    sx={{
                        height: '1px',
                        bgcolor: alpha(primaryColor, 0.08),
                        my: 0.5
                    }}
                />

                {/* Price and Action Row */}
                <Box
                    sx={{
                        mt: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    {/* Price Section */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="caption"
                            display="block"
                            sx={{
                                color: config.theme.palette.text.secondary,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                mb: 0.5,
                                fontFamily: fontFamily
                            }}
                        >
                            {viewConfig.labels?.priceLabel || "Price"}
                        </Typography>
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                                color: primaryColor,
                                fontFamily: fontFamily,
                                fontSize: '1.5rem',
                                letterSpacing: '-0.02em',
                                lineHeight: 1
                            }}
                        >
                            {item.price}
                        </Typography>
                    </Box>

                    {/* Action Button */}
                    <Button
                        variant="contained"
                        size="medium"
                        className="card-action-button"
                        sx={{
                            borderRadius: `${config.theme.shape.buttonRadius}px`,
                            background: config.theme.gradients.primary,
                            color: config.theme.palette.primary.contrastText,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontFamily: fontFamily,
                            boxShadow: config.theme.shadows.colored,
                            transform: 'translateX(4px)',
                            opacity: 0.9,
                            border: 'none',
                            outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                filter: 'brightness(1.1)',
                                boxShadow: config.theme.shadows.hard,
                                transform: 'translateX(0) scale(1.05)'
                            },
                            '&:focus': {
                                outline: 'none'
                            }
                        }}
                    >
                        {viewConfig.labels?.viewButton || "View"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

const DiscoveryView: React.FC = () => {
    const { config } = useConfig();
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [radius, setRadius] = useState<number>(1000);
    const [searchMode, setSearchMode] = useState(0); // 0: AI Text, 1: Discovery (Location/JSONPath)
    const resultsRef = useRef<HTMLDivElement>(null);

    if (!config) return null;

    const primaryColor = config.theme.palette.primary.main;
    const fontFamily = config.theme.typography.fontFamily;
    const backgroundColor = config.theme.palette.background.default;

    // Helper to dynamically load icons
    const renderIcon = (iconName: string, props: any = {}) => {
        // @ts-ignore
        const IconComponent = Icons[iconName] || Icons.HelpOutline;
        return <IconComponent {...props} />;
    };

    const heroIconName = config.theme.icons.heroSearch || 'AutoAwesome';
    const discoveryIconName = config.theme.icons.networkDiscovery || 'Explore';

    const viewConfig = Object.values(config.views).find((v: any) => v.type === 'search') as DiscoveryViewConfig | undefined;

    if (!viewConfig) {
        return <Box p={4}>Discovery View not configured.</Box>;
    }

    const { filters: filterDefinitions } = viewConfig;

    const handleSearch = () => {
        setIsLoading(true);
        // Simulate different API calls based on mode
        console.log(searchMode === 0 ? 'Calling AI Text Search API...' : 'Calling Discovery API...');

        setTimeout(() => {
            setIsLoading(false);
            setResults([
                {
                    id: 1,
                    name: 'Premium Organic Basmati Rice',
                    price: '₹285',
                    rating: 4.5,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Rice',
                    category: 'Grocery',
                    description: 'Aged for perfection, this premium basmati rice offers delightful aroma and fluffy texture.'
                },
                {
                    id: 2,
                    name: 'Fresh Farm Tomatoes',
                    price: '₹42/kg',
                    rating: 4.2,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Tomatoes',
                    category: 'Vegetables',
                    description: 'Locally sourced, vine-ripened tomatoes perfect for curries and salads.'
                },
                {
                    id: 3,
                    name: 'Cold Pressed Sunflower Oil',
                    price: '₹195',
                    rating: 4.8,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Oil',
                    category: 'Grocery',
                    description: 'Pure, organic cold-pressed oil for healthy cooking.'
                }
            ]);

            // Auto-scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 1500);
    };

    // Derived filtering for JSONPath/Category based on config
    const categoryFilter = filterDefinitions?.find(f => f.id === 'category');
    const jsonpathFilter = filterDefinitions?.find(f => f.id === 'jsonpath');

    // Validation for Discovery Mode
    const isDiscoveryValid = () => {
        // Example check: Need Location OR JSONPath
        // In a real app, check specific state values. 
        // For now, assuming default 'Location' location is valid if untouched, 
        // so we just return true or check if fields are cleared. 
        // Users mentioned "Location or JSONPath is mandatory".
        // Let's assume empty string checks if we were tracking them controlled fully.
        // For UI demo, default is valid.
        return true;
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: backgroundColor }}>
            {/* Hero Section */}
            {/* Top Branding & Search Area */}
            <Box
                sx={{
                    pt: { xs: 4, sm: 6, md: 8 },
                    pb: { xs: 3, sm: 4, md: 6 },
                    background: config.theme.gradients.surface
                }}
            >
                <Container sx={{ maxWidth: '1200px !important' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: `${config.theme.shape.searchBarRadius}px`,
                            bgcolor: config.theme.palette.background.paper,
                            boxShadow: config.theme.shadows.soft,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 }, maxWidth: 860, mx: 'auto' }}>
                            <Typography
                                variant="h3"
                                component="h1"
                                fontWeight={700}
                                sx={{
                                    fontFamily: fontFamily,
                                    letterSpacing: '-0.02em',
                                    background: config.theme.gradients.heroText,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: { xs: 1, sm: 2 },
                                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                    flexWrap: 'wrap'
                                }}
                            >
                                {searchMode === 0 && renderIcon(heroIconName, { sx: { fontSize: { xs: 32, sm: 36, md: 40 }, color: primaryColor } })}
                                {searchMode === 0 ? (viewConfig.labels?.modeAiTitle || "AI Product Search") : (viewConfig.labels?.modeNetworkTitle || "Network Discovery")}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: fontFamily, maxWidth: 660, mx: 'auto', fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 0 } }}>
                                {searchMode === 0
                                    ? (viewConfig.labels?.modeAiSub || "Experience the power of AI.")
                                    : (viewConfig.labels?.modeNetworkSub || "Explore the ONDC network.")
                                }
                            </Typography>
                        </Box>

                        {/* Custom Segmented Tabs */}
                        <Paper
                            elevation={0}
                            sx={{
                                display: 'inline-flex',
                                p: { xs: '6px', sm: '4px' },
                                mb: { xs: 3, sm: 4, md: 5 },
                                borderRadius: { xs: `${config.theme.shape.buttonRadius + 8}px`, sm: `${config.theme.shape.searchBarRadius}px` },
                                bgcolor: config.theme.palette.background.default,
                                mx: 'auto',
                                position: 'relative',
                                left: { xs: 0, sm: '50%' },
                                transform: { xs: 'none', sm: 'translateX(-50%)' },
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                                flexDirection: { xs: 'column', sm: 'row' },
                                width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                                maxWidth: { xs: 'calc(100% - 32px)', sm: 'none' },
                                gap: { xs: '4px', sm: 0 }
                            }}
                        >
                            {[
                                { label: viewConfig.labels?.tabAi || 'AI Search', value: 0 },
                                { label: viewConfig.labels?.tabNetwork || 'Network Discovery', value: 1 }
                            ].map((tab) => (
                                <Button
                                    key={tab.value}
                                    onClick={() => setSearchMode(tab.value)}
                                    startIcon={tab.value === 0 ? renderIcon(heroIconName, { sx: { fontSize: 16 } }) : renderIcon(discoveryIconName, { sx: { fontSize: 16 } })}
                                    size="small"
                                    sx={{
                                        borderRadius: `${config.theme.shape.buttonRadius}px`,
                                        px: { xs: 2, sm: 2.5 },
                                        py: 0.6,
                                        minHeight: 32,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                        fontFamily: fontFamily,
                                        color: searchMode === tab.value ? config.theme.palette.primary.contrastText : 'text.secondary',
                                        background: searchMode === tab.value ? primaryColor : 'transparent',
                                        boxShadow: searchMode === tab.value ? config.theme.shadows.soft : 'none',
                                        border: 'none',
                                        outline: 'none',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': {
                                            color: searchMode === tab.value ? config.theme.palette.primary.contrastText : primaryColor,
                                            background: searchMode === tab.value ? primaryColor : config.theme.palette.background.paper
                                        },
                                        '&:focus': {
                                            outline: 'none'
                                        }
                                    }}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </Paper>

                        {/* MODE A: AI TEXT SEARCH */}
                        {searchMode === 0 && (
                            <Box sx={{ maxWidth: { xs: '100%', sm: 900 }, mx: 'auto', position: 'relative', zIndex: 10, px: { xs: 0, sm: 2 } }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: '4px', sm: '6px' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        borderRadius: `${config.theme.shape.searchBarRadius}px`,
                                        bgcolor: '#ffffff',
                                        border: '1px solid',
                                        borderColor: alpha(primaryColor, 0.12),
                                        boxShadow: `0 2px 12px ${alpha(primaryColor, 0.08)}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            borderColor: alpha(primaryColor, 0.3),
                                            boxShadow: `0 4px 20px ${alpha(primaryColor, 0.15)}, 0 0 0 4px ${alpha(primaryColor, 0.05)}`
                                        },
                                        '&:focus-within': {
                                            borderColor: primaryColor,
                                            boxShadow: `0 4px 24px ${alpha(primaryColor, 0.2)}, 0 0 0 4px ${alpha(primaryColor, 0.08)}`,
                                            transform: { xs: 'none', sm: 'translateY(-2px)' }
                                        }
                                    }}
                                >
                                    <Box sx={{ pl: { xs: 2, sm: 3 }, pr: { xs: 1, sm: 2 }, display: 'flex', alignItems: 'center', color: alpha(primaryColor, 0.7) }}>
                                        {renderIcon('Search', { sx: { fontSize: { xs: 20, sm: 24 } } })}
                                    </Box>
                                    <InputBase
                                        fullWidth
                                        autoFocus
                                        placeholder={viewConfig.labels?.searchPlaceholder || viewConfig.search.placeholder}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        sx={{
                                            fontFamily: fontFamily,
                                            fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                            fontWeight: 400,
                                            color: config.theme.palette.text.primary,
                                            py: { xs: 0.5, sm: 0.5 },
                                            px: { xs: 0.5, sm: 0 },
                                            flex: 1,
                                            minWidth: { xs: '150px', sm: 'auto' },
                                            '& input::placeholder': {
                                                color: config.theme.palette.text.secondary,
                                                opacity: 0.6
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        sx={{
                                            minWidth: { xs: '48px', sm: '52px' },
                                            height: { xs: '46px', sm: '52px' },
                                            borderRadius: `${config.theme.shape.buttonRadius}px`,
                                            p: 0,
                                            mr: { xs: 0, sm: 0.5 },
                                            border: 'none',
                                            outline: 'none',
                                            color: config.theme.palette.primary.contrastText,
                                            background: config.theme.gradients.primary,
                                            boxShadow: config.theme.shadows.colored,
                                            '&:hover': {
                                                filter: 'brightness(1.1)',
                                                transform: { xs: 'none', sm: 'scale(1.05)' },
                                                boxShadow: config.theme.shadows.hard
                                            },
                                            '&:focus': {
                                                outline: 'none'
                                            }
                                        }}
                                    >
                                        {isLoading ? <CircularProgress size={24} color="inherit" /> : renderIcon('Search', { sx: { fontSize: { xs: 24, sm: 26 } } })}
                                    </Button>
                                </Paper>
                            </Box>
                        )}

                        {/* MODE B: DISCOVERY (Location / JSONPath) */}
                        {searchMode === 1 && (
                            <Box sx={{ maxWidth: 780, mx: 'auto' }}>
                                {/* Unified Search Console */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        bgcolor: config.theme.palette.background.paper,
                                        borderRadius: `${config.theme.shape.borderRadius}px`,
                                        boxShadow: config.theme.shadows.medium,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Row 1: Location & Radius */}
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                        {/* Location */}
                                        <Box sx={{
                                            flex: 1,
                                            p: 2.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'transparent',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                            borderRadius: 2,
                                            m: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.3s ease',
                                            cursor: 'text',
                                            '&:hover': {
                                                borderColor: primaryColor,
                                                boxShadow: `inset 0 3px 6px rgba(0,0,0,0.06), 0 0 0 1px ${alpha(primaryColor, 0.1)}`,
                                                bgcolor: alpha(primaryColor, 0.02)
                                            }
                                        }}>
                                            {renderIcon('LocationOn', { sx: { color: primaryColor, fontSize: 24, mr: 2 } })}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                    {viewConfig.labels?.locationLabel || "Target Location"}
                                                </Typography>
                                                <InputBase
                                                    fullWidth
                                                    placeholder="12.9716, 77.5946"
                                                    defaultValue="12.9716, 77.5946"
                                                    sx={{
                                                        fontFamily: fontFamily,
                                                        fontWeight: 500,
                                                        fontSize: '1rem',
                                                        color: config.theme.palette.text.primary
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Vertical Divider for Desktop */}
                                        <Box sx={{ width: '1px', bgcolor: 'divider', display: { xs: 'none', md: 'block' } }} />
                                        {/* Horizontal Divider for Mobile */}
                                        <Box sx={{ height: '1px', bgcolor: 'divider', display: { xs: 'block', md: 'none' } }} />

                                        {/* Radius */}
                                        <Box sx={{
                                            width: { xs: '100%', md: '35%' },
                                            p: 2.5,
                                            bgcolor: 'transparent',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                            borderRadius: 2,
                                            m: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: primaryColor,
                                                boxShadow: `inset 0 3px 6px rgba(0,0,0,0.06), 0 0 0 1px ${alpha(primaryColor, 0.1)}`,
                                                bgcolor: alpha(primaryColor, 0.02)
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {viewConfig.labels?.radiusLabel || "Search Radius"}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: primaryColor }}>
                                                    {radius}m
                                                </Typography>
                                            </Box>
                                            <Slider
                                                value={radius}
                                                onChange={(_, v) => setRadius(v as number)}
                                                min={100}
                                                max={10000}
                                                step={100}
                                                size="small"
                                                sx={{
                                                    color: primaryColor,
                                                    height: 4,
                                                    p: 1,
                                                    '& .MuiSlider-thumb': {
                                                        width: 14,
                                                        height: 14,
                                                        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                                        '&:before': { boxShadow: 'none' },
                                                        '&:hover, &.Mui-focusVisible': {
                                                            boxShadow: `0 0 0 6px ${alpha(primaryColor, 0.1)}`
                                                        }
                                                    },
                                                    '& .MuiSlider-rail': { opacity: 0.2 }
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ height: '1px', bgcolor: 'divider' }} />

                                    {/* Row 2: Advanced Filter */}
                                    {jsonpathFilter && (
                                        <Box sx={{
                                            p: 2.5,
                                            bgcolor: 'transparent',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                            borderRadius: 2,
                                            m: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.3s ease',
                                            cursor: 'text',
                                            '&:hover': {
                                                borderColor: primaryColor,
                                                boxShadow: `inset 0 3px 6px rgba(0,0,0,0.06), 0 0 0 1px ${alpha(primaryColor, 0.1)}`,
                                                bgcolor: alpha(primaryColor, 0.02)
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                                                {renderIcon('Code', { sx: { fontSize: 20, color: 'text.secondary', mr: 2, transform: 'translateY(4px)' } })}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} sx={{ color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                        {viewConfig.labels?.advancedQueryLabel || "Advanced Query (JSONPath)"}
                                                    </Typography>
                                                    <InputBase
                                                        fullWidth
                                                        multiline
                                                        rows={1} // Compact by default
                                                        placeholder="$.message.catalog.bpp/providers[?(@.id=='P1')]"
                                                        value={filters[jsonpathFilter!.id] || ''}
                                                        onChange={(e) => setFilters({ ...filters, [jsonpathFilter!.id]: e.target.value })}
                                                        sx={{
                                                            fontFamily: 'Consolas, Monaco, monospace',
                                                            fontSize: '0.9rem',
                                                            color: config.theme.palette.text.primary
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Category Chips - Outside */}
                                {categoryFilter && (
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ maxWidth: 600 }}>
                                            {categoryFilter.options.map(opt => (
                                                <Chip
                                                    key={opt.value}
                                                    label={opt.label}
                                                    clickable
                                                    onClick={() => setFilters({
                                                        ...filters,
                                                        [categoryFilter!.id]: filters[categoryFilter!.id] === opt.value ? '' : opt.value
                                                    })}
                                                    sx={{
                                                        bgcolor: filters[categoryFilter!.id] === opt.value ? primaryColor : config.theme.palette.background.default,
                                                        border: '1px solid',
                                                        borderColor: filters[categoryFilter!.id] === opt.value ? primaryColor : 'divider',
                                                        color: filters[categoryFilter!.id] === opt.value ? config.theme.palette.primary.contrastText : 'text.secondary',
                                                        fontFamily: fontFamily,
                                                        fontWeight: filters[categoryFilter!.id] === opt.value ? 600 : 500,
                                                        boxShadow: filters[categoryFilter!.id] === opt.value
                                                            ? config.theme.shadows.colored
                                                            : '0 2px 8px rgba(0,0,0,0.05)',
                                                        '&:hover': {
                                                            bgcolor: filters[categoryFilter!.id] === opt.value ? primaryColor : alpha(primaryColor, 0.05),
                                                            transform: 'translateY(-1px)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}


                                {/* Action Button */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSearch}
                                            startIcon={!isLoading && renderIcon(discoveryIconName, { sx: { fontSize: 20 } })}
                                            sx={{
                                                borderRadius: `${config.theme.shape.buttonRadius}px`,
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                px: 6,
                                                py: 1.2,
                                                color: config.theme.palette.primary.contrastText,
                                                letterSpacing: '0.02em',
                                                background: config.theme.gradients.primary,
                                                boxShadow: config.theme.shadows.colored,
                                                border: 'none',
                                                outline: 'none',
                                                '&:hover': {
                                                    filter: 'brightness(1.1)',
                                                    boxShadow: config.theme.shadows.hard,
                                                    transform: 'translateY(-1px)'
                                                },
                                                '&:focus': {
                                                    outline: 'none'
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            {isLoading ? <CircularProgress size={20} color="inherit" /> : (viewConfig.labels?.actionButton || 'Start Network Discovery')}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Box>
                        )}

                        {/* Results Area */}
                        <Box ref={resultsRef} sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                            {/* Results */}
                            <Box>
                                {results.length > 0 && (
                                    <Box sx={{ mb: 3, ml: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: 'text.secondary',
                                                fontWeight: 700,
                                                fontFamily: fontFamily
                                            }}
                                        >
                                            {(viewConfig.labels?.resultsCount || 'Found {count} Matches').replace('{count}', results.length.toString())}
                                        </Typography>
                                    </Box>
                                )}

                                {results.length === 0 && !isLoading ? (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            textAlign: 'center',
                                            background: config.theme.gradients.surface,
                                            border: '2px dashed',
                                            borderColor: alpha(primaryColor, 0.15),
                                            borderRadius: `${config.theme.shape.borderRadius}px`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            transition: 'all 0.3s ease',
                                            boxShadow: config.theme.shadows.soft
                                        }}
                                    >
                                        {renderIcon('Search', { sx: { fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 } })}
                                        <Typography variant="h6" gutterBottom sx={{ fontFamily: fontFamily, color: 'text.secondary' }}>
                                            {viewConfig.labels?.emptyTitle || 'Start by searching for items'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                                            {viewConfig.labels?.emptySub || 'Use typical keywords like "Grocery" or "Coffee"'}
                                        </Typography>
                                    </Paper>
                                ) : (
                                    <Grid container spacing={4} alignItems="stretch">
                                        {results.map(item => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id} sx={{ display: 'flex' }}>
                                                <ResultCard item={item} config={config} viewConfig={viewConfig} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default DiscoveryView;
