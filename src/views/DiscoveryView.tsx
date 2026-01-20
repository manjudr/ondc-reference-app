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
                    pt: 8,
                    pb: 6,
                    background: config.theme.gradients.surface
                }}
            >
                <Container sx={{ maxWidth: '1200px !important' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: `${config.theme.shape.searchBarRadius}px`,
                            bgcolor: config.theme.palette.background.paper,
                            boxShadow: config.theme.shadows.soft,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 860, mx: 'auto' }}>
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
                                    gap: 2
                                }}
                            >
                                {searchMode === 0 && renderIcon(heroIconName, { sx: { fontSize: 40, color: primaryColor } })}
                                {searchMode === 0 ? (viewConfig.labels?.modeAiTitle || "AI Product Search") : (viewConfig.labels?.modeNetworkTitle || "Network Discovery")}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: fontFamily, maxWidth: 660, mx: 'auto' }}>
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
                                p: '4px',
                                mb: 5,
                                borderRadius: `${config.theme.shape.searchBarRadius}px`,
                                bgcolor: config.theme.palette.background.default, // Contrast against main white paper
                                mx: 'auto',
                                position: 'relative',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
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
                                        px: 2.5,
                                        py: 0.6,
                                        minHeight: 32,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        fontFamily: fontFamily,
                                        color: searchMode === tab.value ? config.theme.palette.primary.contrastText : 'text.secondary',
                                        background: searchMode === tab.value ? primaryColor : 'transparent',
                                        boxShadow: searchMode === tab.value ? config.theme.shadows.soft : 'none',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            color: searchMode === tab.value ? config.theme.palette.primary.contrastText : primaryColor,
                                            background: searchMode === tab.value ? primaryColor : config.theme.palette.background.paper
                                        }
                                    }}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </Paper>

                        {/* MODE A: AI TEXT SEARCH */}
                        {searchMode === 0 && (
                            <Box sx={{ maxWidth: 860, mx: 'auto', position: 'relative', zIndex: 10 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: `${config.theme.shape.searchBarRadius}px`,
                                        bgcolor: config.theme.palette.background.default, // Subtle contrast
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: config.theme.shadows.medium,
                                        transition: 'all 0.3s ease',
                                        '&:hover, &:focus-within': {
                                            boxShadow: config.theme.shadows.hard,
                                            transform: 'scale(1.01)'
                                        }
                                    }}
                                >
                                    <Box sx={{ pl: 2.5, pr: 1, display: 'flex', color: primaryColor }}>
                                        {renderIcon(heroIconName, { sx: { fontSize: 22 } })}
                                    </Box>
                                    <InputBase
                                        fullWidth
                                        autoFocus
                                        placeholder={viewConfig.labels?.searchPlaceholder || viewConfig.search.placeholder}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        sx={{
                                            pl: 0.5,
                                            fontFamily: fontFamily,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            color: config.theme.palette.text.primary
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        sx={{
                                            minWidth: '46px',
                                            height: '46px',
                                            borderRadius: `${config.theme.shape.buttonRadius}px`,
                                            p: 0,
                                            ml: 1,
                                            color: config.theme.palette.primary.contrastText,
                                            background: config.theme.gradients.primary,
                                            boxShadow: config.theme.shadows.colored,
                                            '&:hover': {
                                                background: primaryColor,
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        {isLoading ? <CircularProgress size={22} color="inherit" /> : renderIcon(heroIconName, { sx: { fontSize: 24 } })}
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
                                        <Box sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center' }}>
                                            {renderIcon('LocationOn', { sx: { color: primaryColor, fontSize: 24, mr: 2 } })}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
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
                                        <Box sx={{ width: { xs: '100%', md: '35%' }, p: 2.5, bgcolor: config.theme.palette.background.default }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                        <Box sx={{ p: 2.5, bgcolor: alpha(primaryColor, 0.01) }}>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                                                {renderIcon('Code', { sx: { fontSize: 20, color: 'text.secondary', mr: 2, transform: 'translateY(4px)' } })}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
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
                                                '&:hover': {
                                                    background: primaryColor,
                                                    boxShadow: config.theme.shadows.hard,
                                                    transform: 'translateY(-1px)'
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
                                                <Card
                                                    elevation={0}
                                                    sx={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderRadius: `${config.theme.shape.borderRadius}px`,
                                                        overflow: 'visible', // For floating elements
                                                        boxShadow: config.theme.shadows.soft,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        bgcolor: config.theme.palette.background.paper,
                                                        position: 'relative',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: config.theme.shadows.medium,
                                                            '& .card-image': {
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden', borderRadius: `${config.theme.shape.borderRadius}px ${config.theme.shape.borderRadius}px 0 0`, bgcolor: alpha(primaryColor, 0.1) }}>
                                                        <CardMedia
                                                            image={item.image}
                                                            className="card-image"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                transition: 'transform 0.5s ease'
                                                            }}
                                                        />
                                                        {/* Floating Badges */}
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 12,
                                                                left: 12,
                                                                display: 'flex',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <Chip
                                                                label={item.category}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(config.theme.palette.background.paper, 0.95),
                                                                    backdropFilter: 'blur(4px)',
                                                                    color: primaryColor,
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    boxShadow: config.theme.shadows.soft
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 12,
                                                                right: 12,
                                                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                                backdropFilter: 'blur(4px)',
                                                                color: config.theme.palette.primary.contrastText,
                                                                borderRadius: `${config.theme.shape.buttonRadius}px`,
                                                                px: 1,
                                                                py: 0.5,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5
                                                            }}
                                                        >
                                                            <Rating value={1} max={1} size="small" readOnly sx={{ color: '#FFD700', fontSize: '1rem' }} />
                                                            <Typography variant="caption" fontWeight={700}>
                                                                {item.rating}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight={700}
                                                            sx={{
                                                                mb: 1,
                                                                fontFamily: fontFamily,
                                                                lineHeight: 1.3,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                minHeight: '2.6em' // Guarantee height for 2 lines
                                                            }}
                                                        >
                                                            {item.name}
                                                        </Typography>

                                                        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Box>
                                                                <Typography variant="caption" display="block" color="text.secondary">
                                                                    {viewConfig.labels?.priceLabel || "Price"}
                                                                </Typography>
                                                                <Typography
                                                                    variant="h5"
                                                                    fontWeight={800}
                                                                    sx={{
                                                                        color: primaryColor,
                                                                        fontFamily: fontFamily,
                                                                        letterSpacing: '-0.5px'
                                                                    }}
                                                                >
                                                                    {item.price}
                                                                </Typography>
                                                            </Box>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: `${config.theme.shape.buttonRadius}px`,
                                                                    borderColor: alpha(primaryColor, 0.3),
                                                                    color: primaryColor,
                                                                    minWidth: 'auto',
                                                                    px: 2,
                                                                    '&:hover': {
                                                                        borderColor: primaryColor,
                                                                        bgcolor: alpha(primaryColor, 0.05)
                                                                    }
                                                                }}
                                                            >
                                                                {viewConfig.labels?.viewButton || "View"}
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
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
