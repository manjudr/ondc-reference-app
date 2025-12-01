import { useEffect, useRef, useState } from 'react';
import { Item, Catalog, RendererConfig } from '../types';
import { renderTemplate } from '../utils/templateRenderer';

interface ItemCardProps {
  item: Item;
  catalog: Catalog;
  rendererConfig: RendererConfig;
  viewType?: 'discoveryCard' | 'detailView' | 'compactCard';
}

export default function ItemCard({ item, catalog, rendererConfig, viewType = 'discoveryCard' }: ItemCardProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const template = rendererConfig.templates[viewType];
    if (template) {
      const html = renderTemplate(template.html, item, catalog);
      setRenderedHtml(html);
    }
  }, [item, catalog, rendererConfig, viewType]);

  useEffect(() => {
    if (containerRef.current && renderedHtml) {
      // Apply styling hints if available
      const dietaryClassification = item['beckn:itemAttributes']?.dietaryClassification;
      if (dietaryClassification && rendererConfig.stylingHints?.dietaryBadge) {
        const badgeStyle = rendererConfig.stylingHints.dietaryBadge[dietaryClassification];
        if (badgeStyle) {
          const badges = containerRef.current.querySelectorAll('.dietary-badge');
          badges.forEach((badge) => {
            (badge as HTMLElement).style.backgroundColor = badgeStyle.backgroundColor;
            (badge as HTMLElement).style.color = badgeStyle.color;
          });
        }
      }
    }
  }, [renderedHtml, item, rendererConfig]);

  if (!renderedHtml) {
    return <div>Loading...</div>;
  }

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      className={`item-card item-card-${viewType}`}
    />
  );
}

