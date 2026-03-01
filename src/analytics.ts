// Google Analytics 4 custom event tracking
// Measurement ID is configured in index.html (G-2FFB2TG70S)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function isLocalhost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function trackEvent(eventName: string, params: Record<string, string | number>) {
  if (isLocalhost() || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/** Track outbound link clicks (Info, Tickets, or Image links) */
function trackOutboundClick(
  venue: string,
  eventTitle: string,
  linkType: "info" | "tickets" | "image",
  destinationUrl: string,
) {
  trackEvent("outbound_click", {
    venue,
    event_title: eventTitle,
    link_type: linkType,
    destination_url: destinationUrl,
  });
}

/** Returns onClick + onAuxClick handlers to track left and middle clicks */
export function outboundClickProps(
  venue: string,
  eventTitle: string,
  linkType: "info" | "tickets" | "image",
  destinationUrl: string,
) {
  const track = () => trackOutboundClick(venue, eventTitle, linkType, destinationUrl);
  return { onClick: track, onAuxClick: track };
}

/** Track view tab changes (shows, calendar, history) */
export function trackViewChange(view: string) {
  trackEvent("view_change", { tab_name: view });
}

/** Track filter interactions */
export function trackFilterApplied(filterType: string, value: string) {
  trackEvent("filter_applied", { filter_type: filterType, filter_value: value });
}