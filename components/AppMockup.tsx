"use client";
import { useState, KeyboardEvent } from "react";

const dateCards = [
  {
    name: "Aisha",
    year: "Junior",
    activity: "Study + Coffee ☕",
    location: "Main Library Café",
    time: "Thu 3pm",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    name: "Priya",
    year: "Sophomore",
    activity: "Quad Picnic 🌿",
    location: "South Lawn",
    time: "Fri 1pm",
    gradient: "from-violet-400 to-purple-600",
  },
  {
    name: "Zoe",
    year: "Senior",
    activity: "Art Gallery 🎨",
    location: "Student Union",
    time: "Sat 2pm",
    gradient: "from-amber-400 to-orange-500",
  },
];

export default function AppMockup() {
  const [selected, setSelected] = useState(0);

  function handleCardKey(e: KeyboardEvent, i: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(i);
    }
  }

  return (
    <section
      style={{ backgroundColor: "var(--cream, #f5f0e8)" }}
      aria-labelledby="mockup-heading"
    >
      <div className="divider-scallop w-full" aria-hidden="true" />

      <div className="py-16 px-4">
        {/* Phone mockup — decorative illustration */}
        <div className="max-w-xs mx-auto" aria-hidden="true">
          <div className="relative bg-[#0d1117] rounded-[2.5rem] p-2 shadow-2xl border border-white/10">
            {/* Status bar */}
            <div className="flex justify-between items-center px-4 py-2">
              <span className="text-white/60 text-[10px]">9:41</span>
              <div className="w-16 h-4 bg-black rounded-full mx-auto" />
              <div className="flex gap-1">
                <span className="text-white/60 text-[10px]">●●●</span>
              </div>
            </div>

            {/* App header */}
            <div className="flex justify-between items-center px-4 py-2">
              <div>
                <p className="font-jersey text-white text-sm">campus crush</p>
                <p className="text-white/40 text-[10px]">your matches this week 💘</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">J</span>
              </div>
            </div>

            {/* Date cards carousel */}
            <div className="px-4 pb-4">
              <p className="text-white/60 text-[10px] mb-3 uppercase tracking-widest">On your campus</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x" style={{ scrollbarWidth: "none" }}>
                {dateCards.map((card, i) => (
                  <div
                    key={card.name}
                    className={`scroll-snap-start flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                      selected === i ? "ring-2 ring-[var(--Color-V3-Primary)]" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected === i}
                    aria-label={`Select ${card.name}, ${card.year}, ${card.activity}`}
                    onClick={() => setSelected(i)}
                    onKeyDown={(e) => handleCardKey(e, i)}
                  >
                    <div className={`h-44 bg-gradient-to-br ${card.gradient} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/20 backdrop-blur text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          {card.year}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-bold text-sm">{card.name}</p>
                        <p className="text-white/70 text-[10px]">{card.activity}</p>
                      </div>
                    </div>
                    <div className="bg-[#161b22] px-3 py-2">
                      <p className="text-white/60 text-[9px]">{card.location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <p className="text-green-400 text-[9px]">{card.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons — 44px min height for touch targets */}
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 rounded-xl bg-white/5 text-white/60 text-[10px] font-medium border border-white/10"
                  style={{ minHeight: "44px" }}
                >
                  Not my type
                </button>
                <button
                  className="flex-1 rounded-xl text-white text-[10px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--Color-V3-Primary), var(--Color-V3-Secondary))",
                    minHeight: "44px",
                  }}
                >
                  Let&apos;s meet! ✓
                </button>
              </div>
            </div>

            {/* Bottom nav — 44px touch targets */}
            <div className="flex justify-around px-4 border-t border-white/5">
              {[
                { icon: "🏠", label: "Home" },
                { icon: "🔍", label: "Search" },
                { icon: "❤️", label: "Likes" },
                { icon: "👤", label: "Profile" },
              ].map(({ icon, label }, i) => (
                <button
                  key={label}
                  aria-label={label}
                  className={`flex items-center justify-center text-base ${i === 0 ? "opacity-100" : "opacity-30"}`}
                  style={{ minHeight: "44px", minWidth: "44px" }}
                >
                  <span aria-hidden="true">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison section */}
        <div className="max-w-sm mx-auto mt-16">
          <p className="text-[#081721]/40 text-[10px] text-center uppercase tracking-widest mb-6">
            Tired of Tinder &amp; Hinge?
          </p>
          <h2
            id="mockup-heading"
            className="font-jersey text-3xl text-[#081721] text-center leading-none mb-8"
          >
            Meet people <span style={{ color: "var(--Color-V3-Primary)" }}>on campus</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#081721] rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
              <div className="badge-green mb-1 text-[9px]">✦ campus crush</div>
              <p className="text-white font-semibold text-xs">One Ready-to-go Hangout</p>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl" aria-hidden="true">💘</div>
              <p className="text-white/60 text-xs">Real meetups, not endless DMs</p>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center gap-2 text-center border border-gray-200">
              <div className="badge-pink mb-1 text-[9px]">other apps</div>
              <p className="text-[#081721] font-semibold text-xs">Endless Swiping &amp; Ghost-ing</p>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl" aria-hidden="true">😩</div>
              <p className="text-gray-600 text-xs">Hours wasted, no real connection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="divider-scallop w-full" aria-hidden="true" />
    </section>
  );
}
