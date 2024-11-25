interface TrackingPayloadItem {
  eventName: string;
  haid: string;
}

interface TrackedElement {
  eventName: string;
  element: HTMLElement;
}

type RouteMeta = {
  domain: string;
  route: string;
  meta: TrackingPayloadItem[];
};

function selectNode(haid: string): HTMLElement {
  const path = haid.split("-")[1].split(".");
  let current = document.body;
  path.forEach((index) => {
    current = current.children[parseInt(index)] as HTMLElement;
  });
  return current;
}

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXJsb29mcW15c3ljeWtzdHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMzYzNTEsImV4cCI6MjA0NzkxMjM1MX0.SKF5LsyqW8f3S0FZYIL3eD5VhOhlJmKyRqrAwSETYQI";

async function getRouteMeta(): Promise<RouteMeta[] | null> {
  const route = window.location.pathname;

  return fetch(
    `https://qvarloofqmysycykstty.supabase.co/rest/v1/route_meta?domain=eq.${getDomain()}&route=eq.${route}&select=*`,
    {
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Range": "0-9",
      },
    },
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching route meta:", error);
      return null;
    });
}

function getDomain(): string {
  let domain = window.location.hostname;
  if (domain.includes("localhost")) {
    domain = "reactiverobot.com";
  }
  return domain;
}

async function doTrack(eventName: string): Promise<Response | null> {
  try {
    const domain = getDomain();
    const route = window.location.pathname;

    const body = JSON.stringify({
      domain: domain,
      route: route,
      name: eventName,
      anon_id: getAnonymousId(),
    });

    const response = await fetch(
      "https://qvarloofqmysycykstty.supabase.co/functions/v1/track-event",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "apikey": API_KEY,
        },
        body: body,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.debug(
      `Event ${eventName} for ${domain}${route} for anon_id=${getAnonymousId()}`,
    );
    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error tracking event:", error.message);
    }
    // Don't throw the error to prevent breaking the main flow
    return null;
  }
}

async function createRouteMeta(): Promise<RouteMeta | null> {
  try {
    const body = JSON.stringify({
      url: window.location.href,
      html: document.documentElement.outerHTML,
    });

    const response = await fetch(
      "https://qvarloofqmysycykstty.supabase.co/functions/v1/parse-url",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "apikey": API_KEY,
        },
        body: body,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.debug(
      `Created route meta for ${window.location.href}`,
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating route meta:", error.message);
    }
    return null;
  }
}

function selectNodes(payload: TrackingPayloadItem[]): TrackedElement[] {
  return payload.map((item) => ({
    eventName: item.eventName,
    element: selectNode(item.haid),
  }));
}

function annotateOnClick(elements: TrackedElement[]): void {
  elements.forEach(({ eventName, element }) => {
    const originalOnClick = element.onclick;
    element.onclick = async (e: MouseEvent) => {
      e.preventDefault();
      await doTrack(eventName);
      const href = (element as HTMLAnchorElement).href;
      if (originalOnClick) {
        originalOnClick.call(element, e);
      }
      if (href) {
        window.location.href = href;
      }
    };
  });
}

function domNodeId(element: HTMLElement): string {
  return `${element.tagName.toLowerCase()}-${domPath(element).join(".")}`;
}

function domPath(element: HTMLElement): number[] {
  const path: number[] = [];
  let current = element;

  while (current.parentNode) {
    const parent = current.parentNode as HTMLElement;
    const children = Array.from(parent.children);
    const index = children.indexOf(current);
    path.unshift(index);
    current = parent;
  }

  return path;
}

function computeHierarchyHash(): string {
  const body = document.body;
  const result: string[] = [];

  function traverse(node: HTMLElement): void {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName.toLowerCase() !== "script"
    ) {
      result.push(node.tagName.toLowerCase());
    }

    for (const child of Array.from(node.children)) {
      traverse(child as HTMLElement);
    }
  }

  traverse(body);
  return result.join(".");
}

function getAnonymousId(): string {
  const cookieName = "supatrack_anonymous_id";
  const existingId = document.cookie.split("; ").find((row) =>
    row.startsWith(cookieName)
  );
  if (existingId) {
    return existingId.split("=")[1];
  }

  const newId = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  // Set cookie to expire in 1 year
  document.cookie = `${cookieName}=${newId};max-age=${
    60 * 60 * 24 * 365
  };path=/`;
  return newId;
}

window.addEventListener("load", async function () {
  const routeMeta = await getRouteMeta();

  const setupTracking = async (meta: RouteMeta) => {
    console.debug(
      `Loaded route meta for ${meta.domain}${meta.route}`,
    );
    console.debug(`Annotating ${meta.meta.length} elements`);
    annotateOnClick(selectNodes(meta.meta));
    doTrack("page_view");
  };

  if (routeMeta && routeMeta.length === 1) {
    await setupTracking(routeMeta[0]);
  } else {
    console.debug("No route meta found, creating...");
    const newMeta = await createRouteMeta();
    if (newMeta) {
      console.debug("Route meta created. Beginning tracking.");
      await setupTracking(newMeta);
    } else {
      console.debug("Failed to create route meta.");
    }
  }
});
