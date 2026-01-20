
import React, { useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    LinearProgress,
    Fade,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import * as Icons from '@mui/icons-material';
import { useConfig } from '../config/ConfigProvider';
import type { CatalogPublishViewConfig } from '../config/types';

const CatalogPublishView: React.FC = () => {
    const { config } = useConfig();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // This component relies entirely on the config context
    if (!config) return null;

    const viewConfig = Object.values(config.views).find((v: any) => v.type === 'form') as CatalogPublishViewConfig | undefined;

    if (!viewConfig) {
        return (
            <Box p={4} textAlign="center">
                <Typography color="error">Catalog Publish View not configured.</Typography>
            </Box>
        );
    }

    const primaryColor = config.theme.palette.primary.main;
    const fontFamily = config.theme.typography.fontFamily;
    const backgroundColor = config.theme.palette.background.default;

    // Helper to dynamically load icons
    const renderIcon = (iconName: string, props: any = {}) => {
        // @ts-ignore
        const IconComponent = Icons[iconName] || Icons.HelpOutline;
        return <IconComponent {...props} />;
    };

    const publishIcon = config.theme.icons.publish || 'Storefront';
    const uploadIcon = config.theme.icons.upload || 'CloudUpload';

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setSuccess(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            // Simple validation for json/csv if needed, currently accepting all matching input accept
            if (droppedFile.name.endsWith('.json') || droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setSuccess(false);
            }
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            setUploading(false);
            setSuccess(true);
            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
        }, 2000);
    };

    const clearFile = () => {
        setFile(null);
        setSuccess(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: backgroundColor }}>
            {/* Hero Section */}
            {/* Top Branding & Upload Area */}
            <Box
                sx={{
                    pt: 8,
                    pb: 6,
                    background: config!.theme.gradients.surface
                }}
            >
                <Container maxWidth="md">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: `${config!.theme.shape.searchBarRadius}px`,
                            bgcolor: config!.theme.palette.background.paper,
                            boxShadow: config!.theme.shadows.medium,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden'
                        }}
                    >
                        <Box mb={6} textAlign="center">
                            <Typography
                                variant="h3"
                                component="h1"
                                fontWeight={700}
                                sx={{
                                    fontFamily: fontFamily,
                                    letterSpacing: '-0.02em',
                                    background: config!.theme.gradients.heroText,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2
                                }}
                            >
                                {renderIcon(publishIcon, { sx: { fontSize: 40, color: primaryColor } })}
                                {viewConfig!.title}
                            </Typography>
                            {viewConfig!.subtitle && (
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ fontFamily: fontFamily, maxWidth: 660, mx: 'auto', lineHeight: 1.6 }}
                                >
                                    {viewConfig!.subtitle}
                                </Typography>
                            )}
                        </Box>
                        <Stack spacing={4}>
                            {!file && !success && (
                                <Box
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => inputRef.current?.click()}
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: dragActive ? primaryColor : alpha(primaryColor, 0.2),
                                        borderRadius: `${config!.theme.shape.borderRadius}px`,
                                        py: 8,
                                        px: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: dragActive ? alpha(primaryColor, 0.06) : alpha(primaryColor, 0.02),
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            borderColor: primaryColor,
                                            backgroundColor: alpha(primaryColor, 0.02),
                                            transform: 'translateY(-2px)',
                                            boxShadow: config!.theme.shadows.soft
                                        }
                                    }}
                                >
                                    <input
                                        ref={inputRef}
                                        accept=".json,.csv"
                                        style={{ display: 'none' }}
                                        id="upload-file-input"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    <Stack spacing={3} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${alpha(primaryColor, 0.1)} 0%, ${alpha(primaryColor, 0.2)} 100%)`,
                                                color: primaryColor,
                                                mb: 1
                                            }}
                                        >
                                            {renderIcon(uploadIcon, { sx: { fontSize: 40 } })}
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontFamily: fontFamily, fontWeight: 700, mb: 1, color: config!.theme.palette.text.primary }}>
                                                {viewConfig.labels?.dropTitle || "Drag & Drop your catalog"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily, mb: 2 }}>
                                                {viewConfig.labels?.dropSub || "or file browser will open automatically"}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    borderRadius: `${config!.theme.shape.buttonRadius}px`,
                                                    textTransform: 'none',
                                                    borderColor: alpha(primaryColor, 0.5),
                                                    color: primaryColor,
                                                    fontWeight: 600,
                                                    px: 3,
                                                    '&:hover': {
                                                        borderColor: primaryColor,
                                                        bgcolor: alpha(primaryColor, 0.05)
                                                    }
                                                }}
                                            >
                                                {viewConfig.labels?.browseButton || "Browse Files"}
                                            </Button>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: fontFamily, pt: 2, display: 'block' }}>
                                            {viewConfig.labels?.formatsText || "Supports JSON and CSV formats"}
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}

                            {file && (
                                <Fade in>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            bgcolor: alpha(primaryColor, 0.05),
                                            border: '1px solid',
                                            borderColor: alpha(primaryColor, 0.2),
                                            borderRadius: `${Math.max(4, config!.theme.shape.borderRadius / 2)}px`
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <InsertDriveFileIcon sx={{ color: primaryColor, fontSize: 32 }} />
                                            <Box flexGrow={1}>
                                                <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: fontFamily }}>
                                                    {file!.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                                                    {(file!.size / 1024).toFixed(2)} KB
                                                </Typography>
                                            </Box>
                                            {!uploading && (
                                                <IconButton onClick={clearFile} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                                                    <CloseIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                        {uploading && (
                                            <Box mt={2}>
                                                <LinearProgress
                                                    variant="indeterminate"
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: `${config!.theme.shape.borderRadius}px`,
                                                        bgcolor: alpha(primaryColor, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: primaryColor
                                                        }
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontFamily: fontFamily }}>
                                                    {viewConfig.labels?.uploadingText || "Uploading catalog data..."}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Fade>
                            )}

                            {success && (
                                <Fade in>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: `${config!.theme.shape.borderRadius}px`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            bgcolor: alpha(primaryColor, 0.05),
                                            border: `1px solid ${alpha(primaryColor, 0.2)}`
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: `${config!.theme.shape.buttonRadius}px`,
                                                bgcolor: alpha(primaryColor, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: primaryColor,
                                                mb: 2
                                            }}
                                        >
                                            {renderIcon(config!.theme.icons.success || 'CheckCircle', { sx: { fontSize: 32 } })}
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontFamily, color: config!.theme.palette.text.primary, mb: 1 }}>
                                            {viewConfig.labels?.successTitle || "Published Successfully!"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: fontFamily, color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                                            {viewConfig.labels?.successSub || "Your catalog has been broadcast to the network."}
                                        </Typography>
                                        <Button
                                            variant="text"
                                            onClick={() => setSuccess(false)}
                                            sx={{
                                                color: primaryColor,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: alpha(primaryColor, 0.1) }
                                            }}
                                        >
                                            {viewConfig.labels?.resetButton || "Upload Another Catalog"}
                                        </Button>
                                    </Paper>
                                </Fade>
                            )}

                            <Box textAlign="center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    disabled={!file || uploading}
                                    onClick={handleUpload}
                                    sx={{
                                        px: 6,
                                        py: 1.2,
                                        borderRadius: `${config!.theme.shape.buttonRadius}px`,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        color: config!.theme.palette.primary.contrastText,
                                        fontFamily: fontFamily,
                                        background: config!.theme.gradients.primary,
                                        boxShadow: `0 8px 20px -6px ${alpha(primaryColor, 0.4)}`,
                                        '&:hover': {
                                            background: primaryColor,
                                            boxShadow: `0 12px 24px -6px ${alpha(primaryColor, 0.5)}`,
                                            transform: 'translateY(-1px)'
                                        },
                                        '&:disabled': {
                                            background: 'rgba(0,0,0,0.12)',
                                            boxShadow: 'none'
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {uploading ? (viewConfig.labels?.publishingButton || 'Publishing...') : (viewConfig.labels?.publishButton || 'Publish Catalog')}
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default CatalogPublishView;
