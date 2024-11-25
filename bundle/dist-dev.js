"use strict";
(() => {
  // bundle/index.ts
  function selectNode(haid) {
    const path = haid.split("-")[1].split(".");
    let current = document.body;
    path.forEach((index) => {
      current = current.children[parseInt(index)];
    });
    return current;
  }
  var API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXJsb29mcW15c3ljeWtzdHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMzYzNTEsImV4cCI6MjA0NzkxMjM1MX0.SKF5LsyqW8f3S0FZYIL3eD5VhOhlJmKyRqrAwSETYQI";
  async function getRouteMeta() {
    let domain = window.location.hostname;
    if (domain.includes("localhost")) {
      domain = "reactiverobot.com";
    }
    const route = window.location.pathname;
    return fetch(
      `https://qvarloofqmysycykstty.supabase.co/rest/v1/route_meta?domain=eq.${domain}&route=eq.${route}&select=*`,
      {
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${API_KEY}`,
          "Range": "0-9"
        }
      }
    ).then((response) => response.json()).catch((error) => {
      console.error("Error fetching route meta:", error);
      return null;
    });
  }
  async function doTrack(eventName) {
    try {
      let domain = window.location.hostname;
      if (domain.includes("localhost")) {
        domain = "reactiverobot.com";
      }
      const route = window.location.pathname;
      const body = JSON.stringify({
        domain,
        route,
        name: eventName,
        anon_id: getAnonymousId()
      });
      const response = await fetch(
        "https://qvarloofqmysycykstty.supabase.co/functions/v1/track-event",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "apikey": API_KEY
          },
          body
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.debug(
        `Event ${eventName} for ${domain}${route} for anon_id=${getAnonymousId()}`
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error tracking event:", error.message);
      }
      return null;
    }
  }
  function selectNodes(payload) {
    return payload.map((item) => ({
      eventName: item.eventName,
      element: selectNode(item.haid)
    }));
  }
  function annotateOnClick(elements) {
    elements.forEach(({ eventName, element }) => {
      const originalOnClick = element.onclick;
      element.onclick = async (e) => {
        e.preventDefault();
        await doTrack(eventName);
        const href = element.href;
        if (originalOnClick) {
          originalOnClick.call(element, e);
        }
        if (href) {
          window.location.href = href;
        }
      };
    });
  }
  function getAnonymousId() {
    const cookieName = "supatrack_anonymous_id";
    const existingId = document.cookie.split("; ").find(
      (row) => row.startsWith(cookieName)
    );
    if (existingId) {
      return existingId.split("=")[1];
    }
    const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    document.cookie = `${cookieName}=${newId};max-age=${60 * 60 * 24 * 365};path=/`;
    return newId;
  }
  window.addEventListener("load", async function() {
    const routeMeta = await getRouteMeta();
    if (routeMeta && routeMeta.length > 0) {
      console.debug(
        `Loaded route meta for ${routeMeta[0].domain}${routeMeta[0].route}`
      );
      console.debug(`Annotating ${routeMeta[0].meta.length} elements`);
      annotateOnClick(selectNodes(routeMeta[0].meta));
      doTrack("page_view");
    }
  });
})();
