"use client";
import { useEffect, useState } from "react";

type Venue = {
  id: string;
  name: string;
  discount: string;
  photo_url: string | null;
  logo_url: string | null;
};

const TILTS = [-2.2, 1.6, -1.2, 2.4, -1.8];
const TAPE_TILTS = [-5, 4, -3, 5, -4];

export default function RestaurantPartners() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/venues")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setVenues(Array.isArray(data.venues) ? data.venues : []);
      })
      .catch(() => {
        if (!cancelled) setVenues([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="grain-heavy"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      {/* Full-bleed blurred photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lesbian-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Light warmth glaze — text contrast comes from the paper cards, not this scrim */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.15) 0%, rgba(247,239,225,0.3) 100%)" }} />

      {/* Content */}
      <div className="section-pad relative" style={{ zIndex: 5, textAlign: "center" }}>
        <h2
          id="partners-heading"
          className="font-jersey paper-plate grain"
          style={{
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            color: "var(--terracotta)",
            display: "inline-block",
          }}
        >
          Restaurant Partnerships
        </h2>

        {/* Polaroid wall — one taped photo per venue slot */}
        <div
          style={{
            marginTop: "3.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2.25rem",
            maxWidth: "68rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {venues.map((venue, i) => (
            <div
              key={venue.id}
              className="scrap-wrap"
              style={{
                transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
                width: "min(25rem, 88vw)",
              }}
            >
              <div
                aria-hidden="true"
                className="washi"
                style={{ transform: `translateX(-50%) rotate(${TAPE_TILTS[i % TAPE_TILTS.length]}deg)` }}
              />
              <figure
                style={{
                  margin: 0,
                  background: "var(--parchment)",
                  padding: "0.85rem 0.85rem 1.15rem",
                  border: "1px solid rgba(43,27,18,0.14)",
                  boxShadow: "0 18px 40px rgba(43,27,18,0.3)",
                }}
              >
                {/* Photo window, venue logo chip pinned in the bottom corner */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    background: "var(--parchment-deep)",
                  }}
                >
                  {venue.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={venue.photo_url}
                      alt={`${venue.name} venue`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "saturate(0.85) sepia(0.12)",
                      }}
                    />
                  ) : (
                    <span
                      className="font-jersey"
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "4.5rem",
                        color: "rgba(43,27,18,0.22)",
                      }}
                    >
                      ?
                    </span>
                  )}
                  {/* Venue logo chip intentionally hidden for now — logo_url
                      stays in the data model, just not rendered. */}
                </div>
                <figcaption style={{ paddingTop: "0.85rem" }}>
                  <p
                    className="font-jersey"
                    style={{
                      fontSize: "1.6rem",
                      letterSpacing: "0.06em",
                      color: "var(--ink)",
                      lineHeight: 1.15,
                    }}
                  >
                    {venue.name}
                  </p>
                  <p
                    style={{
                      marginTop: "0.35rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--terracotta-deep)",
                    }}
                  >
                    {venue.discount}
                  </p>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
