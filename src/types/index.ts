export interface DiscoverRequest {
  context: {
    version: string;
    action: string;
    domain: string;
    bap_id: string;
    bap_uri: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
    ttl: string;
    schema_context: string[];
  };
  message: {
    text_search?: string;
    spatial?: Array<{
      op: string;
      targets: string;
      geometry: {
        type: string;
        coordinates: number[];
      };
      distanceMeters: number;
    }>;
    filters?: {
      type: string;
      expression: string;
    };
  };
}

export interface CatalogResponse {
  context: {
    version: string;
    action: string;
    domain: string;
    timestamp: string;
    transaction_id: string;
    message_id: string;
    bap_id: string;
    bap_uri: string;
    bpp_id: string;
    bpp_uri: string;
    ttl: string;
  };
  message: {
    catalogs: Catalog[];
  };
}

export interface Catalog {
  "@context": string;
  "@type": string;
  "beckn:id": string;
  "beckn:descriptor": {
    "@type": string;
    "schema:name": string;
    "beckn:shortDesc": string;
  };
  "beckn:bppId": string;
  "beckn:bppUri": string;
  "beckn:validity": {
    "@type": string;
    "schema:startDate": string;
    "schema:endDate": string;
  };
  "beckn:items": Item[];
  "beckn:offers": Offer[];
}

export interface Item {
  "@context": string;
  "@type": string;
  "beckn:id": string;
  "beckn:descriptor": {
    "@type": string;
    "schema:name": string;
    "beckn:shortDesc": string;
    "beckn:longDesc"?: string;
  };
  "beckn:category": {
    "@type": string;
    "schema:codeValue": string;
    "schema:name": string;
  };
  "beckn:availableAt": Array<{
    "@type": string;
    geo: {
      type: string;
      coordinates: number[];
    };
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  }>;
  "beckn:rateable": boolean;
  "beckn:rating": {
    "@type": string;
    "beckn:ratingValue": number;
    "beckn:ratingCount": number;
  };
  "beckn:isActive": boolean;
  "beckn:networkId": string[];
  "beckn:provider": {
    "beckn:id": string;
    "beckn:descriptor": {
      "@type": string;
      "schema:name": string;
    };
  };
  "beckn:itemAttributes": GroceryItemAttributes | PizzaItemAttributes;
}

export interface GroceryItemAttributes {
  "@context": string;
  "@type": string;
  category: string;
  manufacturerOrPacker?: {
    type: string;
    name: string;
    id?: string;
    address?: string;
  };
  commonOrGenericNameOfCommodity?: string;
  netQuantityOrMeasureInPackage?: {
    unitText: string;
    unitCode: string;
    unitQuantity: number;
  };
  manufacturePackingImportDate?: {
    month: number;
    year: number;
  };
  nutritionalInfo?: Array<{
    nutrient: string;
    value: {
      unitText: string;
      unitCode: string;
      unitQuantity: number;
    };
  }>;
  additivesInfo?: string;
  brandOwnerFssaiLicenseNo?: string;
  dietaryClassification: string;
}

export interface PizzaItemAttributes {
  "@context": string;
  "@type": string;
  category: string;
  dietaryClassification: string;
  crust: string;
  size: string;
  toppings?: string[];
}

export interface Offer {
  "@context": string;
  "@type": string;
  "beckn:id": string;
  "beckn:descriptor": {
    "@type": string;
    "schema:name": string;
  };
  "beckn:items": string[];
  "beckn:price": {
    currency: string;
    value: number;
    applicableQuantity: {
      unitText: string;
      unitCode: string;
      unitQuantity: number;
    };
  };
  "beckn:validity": {
    "@type": string;
    "schema:startDate": string;
    "schema:endDate": string;
  };
  "beckn:acceptedPaymentMethod": string[];
  "beckn:provider": string;
}

export interface RendererConfig {
  $comment?: string;
  description: string;
  version: string;
  templates: {
    discoveryCard: Template;
    detailView: Template;
    compactCard?: Template;
    customizationSelector?: Template;
  };
  stylingHints?: {
    dietaryBadge?: {
      [key: string]: {
        backgroundColor: string;
        color: string;
        text: string;
      };
    };
    cardLayout?: {
      default: string;
      alternatives: string[];
    };
    customizationBadges?: {
      [key: string]: {
        backgroundColor: string;
        color: string;
      };
    };
  };
}

export interface Template {
  name: string;
  description: string;
  html: string;
  dataPaths: {
    [key: string]: string | string[];
  };
}

