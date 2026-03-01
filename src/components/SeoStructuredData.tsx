import { useEffect } from "react";
import type { Event } from "../types";

interface VenueInfo {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

const VENUE_INFO: Record<string, VenueInfo> = {
  theslowdown: { name: "Slowdown", streetAddress: "729 N 14th St", city: "Omaha", state: "NE", postalCode: "68102" },
  waitingroom: { name: "Waiting Room Lounge", streetAddress: "6212 Maple St", city: "Omaha", state: "NE", postalCode: "68104" },
  reverblounge: { name: "Reverb Lounge", streetAddress: "6121 Military Ave", city: "Omaha", state: "NE", postalCode: "68104" },
  admiral: { name: "Admiral", streetAddress: "1501 Jackson St", city: "Omaha", state: "NE", postalCode: "68102" },
  bourbontheatre: { name: "Bourbon Theatre", streetAddress: "1415 O St", city: "Lincoln", state: "NE", postalCode: "68508" },
  astrotheater: { name: "The Astro", streetAddress: "2105 Farnam St", city: "Omaha", state: "NE", postalCode: "68102" },
  steelhouse: { name: "Steelhouse Omaha", streetAddress: "1228 S 6th St", city: "Omaha", state: "NE", postalCode: "68108" },
  holland: { name: "Holland Center", streetAddress: "1200 Douglas St", city: "Omaha", state: "NE", postalCode: "68102" },
  orpheum: { name: "Orpheum Theater", streetAddress: "409 S 16th St", city: "Omaha", state: "NE", postalCode: "68102" },
  barnato: { name: "Barnato", streetAddress: "7023 Farnam St", city: "Omaha", state: "NE", postalCode: "68132" },
};

function buildEventSchema(event: Event) {
  const venue = VENUE_INFO[event.source];
  const startDate = event.time
    ? `${event.date}T${event.time}:00`
    : event.date;

  const schema: Record<string, unknown> = {
    "@type": "MusicEvent",
    name: event.title,
    startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  if (venue) {
    schema.location = {
      "@type": "Place",
      name: venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: venue.streetAddress,
        addressLocality: venue.city,
        addressRegion: venue.state,
        postalCode: venue.postalCode,
        addressCountry: "US",
      },
    };
  } else {
    schema.location = {
      "@type": "Place",
      name: event.venue,
    };
  }

  if (event.imageUrl) {
    schema.image = event.imageUrl.startsWith("http")
      ? event.imageUrl
      : `https://omahashows.com${event.imageUrl}`;
  }

  if (event.eventUrl) {
    schema.url = event.eventUrl;
  }

  if (event.ticketUrl || event.price) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      url: event.ticketUrl || event.eventUrl || "https://omahashows.com/",
      availability: "https://schema.org/InStock",
    };
    if (event.price) {
      if (event.price.toLowerCase() === "free") {
        offer.price = "0";
        offer.priceCurrency = "USD";
      } else {
        const match = event.price.match(/\$(\d+(?:\.\d{2})?)/);
        if (match) {
          offer.price = match[1];
          offer.priceCurrency = "USD";
        }
      }
    }
    schema.offers = offer;
  }

  if (event.supportingArtists && event.supportingArtists.length > 0) {
    schema.performer = [
      { "@type": "MusicGroup", name: event.title },
      ...event.supportingArtists.map(artist => ({
        "@type": "MusicGroup",
        name: artist,
      })),
    ];
  } else {
    schema.performer = { "@type": "MusicGroup", name: event.title };
  }

  return schema;
}

export function SeoStructuredData({ events }: { events: Event[] }) {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Upcoming Shows in Omaha",
      numberOfItems: events.length,
      itemListElement: events.map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: buildEventSchema(event),
      })),
    };

    const id = "seo-events-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [events]);

  return null;
}
