import Handlebars from 'handlebars';

// Helper to get nested property value from object
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Handle array access like "offers[0]"
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key];
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }
  
  return current;
}

// Register Handlebars helpers
Handlebars.registerHelper('if', function(conditional: any, options: any) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('each', function(context: any, options: any) {
  if (!context || typeof context !== 'object') {
    return '';
  }
  
  let ret = '';
  if (Array.isArray(context)) {
    for (let i = 0; i < context.length; i++) {
      ret += options.fn(context[i], {
        data: options.data,
        blockParams: [context[i], i]
      });
    }
  } else {
    for (const key in context) {
      if (context.hasOwnProperty(key)) {
        ret += options.fn(context[key], {
          data: options.data,
          blockParams: [context[key], key]
        });
      }
    }
  }
  return ret;
});

Handlebars.registerHelper('repeat', function(count: number) {
  if (typeof count !== 'number') return '';
  return '★'.repeat(Math.round(count || 0));
});

Handlebars.registerHelper('unless', function(conditional: any, options: any) {
  if (!conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

// Custom helper to access properties with colons
Handlebars.registerHelper('get', function(path: string) {
  return getNestedValue(this, path);
});

// Prepare data object for template rendering
function prepareDataForTemplate(item: any, catalog: any): any {
  const data: any = { ...item };
  
  // Find matching offer for this item
  const itemId = item['beckn:id'];
  const matchingOffer = catalog['beckn:offers']?.find((offer: any) => 
    offer['beckn:items']?.includes(itemId)
  );
  
  if (matchingOffer) {
    data['beckn:offers'] = [matchingOffer];
  }
  
  return data;
}

// Transform template to route colon-based paths through the `get` helper
function transformTemplate(templateHtml: string): string {
  let result = templateHtml;

  // 1) Transform block helpers like {{#if beckn:itemAttributes.foo}} ... {{/if}}
  result = result.replace(/{{#if\s+([^}]+)}}/g, (match, expr) => {
    const path = expr.trim();
    if (!path.includes(':')) return match;
    // Avoid double-wrapping
    if (path.startsWith('(get ')) return match;
    return `{{#if (get "${path}")}}`;
  });

  result = result.replace(/{{#each\s+([^}]+)}}/g, (match, expr) => {
    const path = expr.trim();
    if (!path.includes(':')) return match;
    if (path.startsWith('(get ')) return match;
    return `{{#each (get "${path}")}}`;
  });

  // 2) Transform simple interpolations like {{beckn:id}} or {{beckn:descriptor.schema:name}}
  result = result.replace(/{{([^#\/][^}]*)}}/g, (match, expr) => {
    const path = expr.trim();
    // Skip helpers / subexpressions we already handle or anything without a colon
    if (!path.includes(':')) return match;
    if (path.startsWith('get ') || path.startsWith('(get ')) return match;
    return `{{get "${path}"}}`;
  });

  return result;
}

export function renderTemplate(
  templateHtml: string,
  item: any,
  catalog: any
): string {
  const data = prepareDataForTemplate(item, catalog);
  
  // Transform template to handle colon-separated property names
  const transformedTemplate = transformTemplate(templateHtml);
  
  // Compile and render template
  const template = Handlebars.compile(transformedTemplate);
  return template(data);
}
