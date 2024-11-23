function selectNode(haid) {
  // const tag = haid.split('-')[0];
  const path = haid.split('-')[1].split('.');
  let current = document.body;
  path.forEach(index => {
    current = current.children[index];
  });
  return current;
}

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXJsb29mcW15c3ljeWtzdHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMzYzNTEsImV4cCI6MjA0NzkxMjM1MX0.SKF5LsyqW8f3S0FZYIL3eD5VhOhlJmKyRqrAwSETYQI';

async function getRouteMeta() {
  let domain = window.location.hostname;
  if (domain.includes('localhost')) {
    domain = 'reactiverobot.com';
  }
  const route = window.location.pathname;
  
  return fetch(`https://qvarloofqmysycykstty.supabase.co/rest/v1/route_meta?domain=eq.${domain}&route=eq.${route}&select=*`, {
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'Range': '0-9'
    }
  })
  .then(response => response.json())
  .catch(error => {
    console.error('Error fetching route meta:', error);
    return null;
  });
}

async function doTrack(eventName) {
  try {
    let domain = window.location.hostname;
    if (domain.includes('localhost')) {
      domain = 'reactiverobot.com';
    }
    const route = window.location.pathname;

    const body = JSON.stringify({
      domain: domain,
      route: route,
      name: eventName,
      anon_id: getAnonymousId(),
    })
          
    const response = await fetch('https://qvarloofqmysycykstty.supabase.co/functions/v1/track-event', {
      method: 'POST',
      mode: "cors",
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Event ${eventName} for ${domain}${route} for anon_id=${getAnonymousId()}`);
    return response;

  } catch (error) {
    console.error('Error tracking event:', error.message);
    // Don't throw the error to prevent breaking the main flow
    return null;
  }
}

function selectNodes(payload) {
  return payload.map(item => ({ eventName: item.eventName, element: selectNode(item.haid) }));
}

function annotateOnClick(elements) {
    elements.forEach(({ eventName, element }) => {
        const originalOnClick = element.onclick;
        element.onclick = async (e) => {
            // Prevent default behavior
            e.preventDefault();
            
            // Wait for tracking to complete
            await doTrack(eventName);
            
            // If this is a link, get the href
            const href = element.href;
            
            // Execute original click handler if it exists
            if (originalOnClick) {
                originalOnClick.call(element, e);
            }
            
            // If this was a link, navigate to the href
            if (href) {
                window.location.href = href;
            }
        };
    });
}

window.addEventListener('load', async function() {
  const routeMeta = await getRouteMeta();
  if (routeMeta && routeMeta.length > 0) {
    console.log(`Loaded route meta for ${routeMeta[0].domain}${routeMeta[0].route}`);
    console.log(`Annotating ${routeMeta[0].meta.length} elements`)
    console.debug(routeMeta[0].meta);
    annotateOnClick(selectNodes(routeMeta[0].meta));
    doTrack('page_view');
  }
});

function domNodeId(element) {
  return `${element.tagName.toLowerCase()}-${domPath(element).join('.')}`;
}

function domPath(element) {
  const path = [];
  let current = element;
  
  while (current.parentNode) {
    const parent = current.parentNode;
    const children = Array.from(parent.children);
    const index = children.indexOf(current);
    path.unshift(index);
    current = parent;
  }
  
  return path;
}

function computeHierarchyHash() {
  const body = document.body;
  const result = [];
  
  function traverse(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'script') {
      result.push(node.tagName.toLowerCase());
    }
    
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(body);
  return result.join('.');
}

function getAnonymousId() {
  const cookieName = 'supatrack_anonymous_id';
  const existingId = document.cookie.split('; ').find(row => row.startsWith(cookieName));
  if (existingId) {
    return existingId.split('=')[1];
  }
  
  const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // Set cookie to expire in 1 year
  document.cookie = `${cookieName}=${newId};max-age=${60*60*24*365};path=/`;
  return newId
}
