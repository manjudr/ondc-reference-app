
export type AppConfig = ClientConfig[];

export interface ClientConfig {
    endpoint: string; // e.g. "/retail", "/evcharging"
    app: {
        title: string;
        logo: string;
        favicon: string;
    };
    theme: {
        mode: 'light' | 'dark';
        palette: {
            primary: { main: string; light: string; dark: string; contrastText: string; };
            background: { default: string; paper: string; surface: string; };
            text: { primary: string; secondary: string; disabled: string; };
            action: { active: string; hover: string; selected: string; };
        };
        typography: {
            fontFamily: string;
            h3: { fontSize: string; fontWeight: number; };
            h4: { fontSize: string; fontWeight: number; };
        };
        shape: { borderRadius: number; searchBarRadius: number; buttonRadius: number; };
        gradients: { primary: string; heroText: string; surface: string; };
        shadows: { soft: string; medium: string; hard: string; colored: string; };
        icons: { [key: string]: string; };
    };
    layout: {
        header: {
            title: string;
            subtitle: string;
            logo: string;
            background: string;
            color: string;
        };
        sidebar: {
            background: string;
            color: string;
            activeColor: string;
            sectionTitle?: string;
            footer?: string;
            items: SidebarItem[];
        };
    };
    network: {
        domain: string;
    };
    schemas: Record<string, SchemaDefinition>;
    views: {
        [key: string]: ViewConfig;
    };
    security?: {
        validateSignatures: boolean;
    };
    apiBaseUrl?: string; // Optional override for API target
}

export interface SidebarItem {
    id: string;
    title: string;
    description?: string;
    icon: string;
    routes?: string[];
    children?: SidebarItem[];
}

export interface SchemaDefinition {
    label: string;
    contextUrl: string;
    rendererUrl: string;
}

export type ViewConfig = DiscoveryViewConfig | CatalogPublishViewConfig;

export interface BaseViewConfig {
    type: string;
    title: string;
    subtitle?: string;
    api: string;
    context?: Record<string, any>;
    labels?: Record<string, string>;
}

export interface DiscoveryViewConfig extends BaseViewConfig {
    type: 'search';
    ui: {
        layout: 'grid' | 'list';
        background: string;
    };
    search: {
        placeholder: string;
        radius: number;
    };
    filters: FilterConfig[];
}

export interface FilterConfig {
    id: string;
    label: string;
    type: 'select' | 'text';
    uiType?: 'dropdown' | 'chips' | 'radio' | 'buttons';
    options: FilterOption[];
}

export interface FilterOption {
    label: string;
    value: string;
    schema: string;
    defaultSearch?: {
        text?: string;
        location?: string;
    };
}

export interface CatalogPublishViewConfig extends BaseViewConfig {
    type: 'form';
}
