import { Catalog, RendererConfig } from '../types';
import ItemCard from './ItemCard';

interface CatalogViewProps {
  catalog: Catalog;
  rendererConfig: RendererConfig;
  viewType?: 'discoveryCard' | 'detailView' | 'compactCard';
}

export default function CatalogView({ catalog, rendererConfig, viewType = 'discoveryCard' }: CatalogViewProps) {
  const items = catalog['beckn:items'] || [];

  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <h2>{catalog['beckn:descriptor']['schema:name']}</h2>
        <p>{catalog['beckn:descriptor']['beckn:shortDesc']}</p>
      </div>
      
      <div className="items-grid">
        {items.map((item) => (
          <ItemCard
            key={item['beckn:id']}
            item={item}
            catalog={catalog}
            rendererConfig={rendererConfig}
            viewType={viewType}
          />
        ))}
      </div>
    </div>
  );
}

