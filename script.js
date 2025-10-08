const { useState, useEffect } = React;

// Routes with stop names
const routes = [
  {
    id: 1,
    name: "Route 101 - Downtown Express",
    stops: [
      { name: "City Center", coords: [28.6139, 77.2090] },
      { name: "Main Square", coords: [28.6200, 77.2200] },
      { name: "Tech Park", coords: [28.6250, 77.2300] },
      { name: "Airport", coords: [28.6300, 77.2400] },
    ],
  },
  {
    id: 2,
    name: "Route 202 - Airport Shuttle",
    stops: [
      { name: "Railway Station", coords: [28.5550, 77.1000] },
      { name: "City Mall", coords: [28.5650, 77.1200] },
      { name: "Library", coords: [28.5800, 77.1400] },
      { name: "University", coords: [28.5900, 77.1600] },
    ],
  },
];

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [search, setSearch] = useState("");
  const [busStates, setBusStates] = useState([]);

  useEffect(() => {
    if (!selectedRoute) return;

    const map = L.map("map").setView(selectedRoute.stops[0].coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Draw route
    const routeLine = L.polyline(
      selectedRoute.stops.map((s) => s.coords),
      { color: "blue" }
    ).addTo(map);

    // Stop markers with names
    const stopMarkers = selectedRoute.stops.map((stop) =>
      L.marker(stop.coords).addTo(map).bindPopup(stop.name)
    );

    // Initialize multiple buses (2 buses)
    const buses = [
      { index: 0, marker: null },
      { index: 1, marker: 1 % selectedRoute.stops.length, marker: null },
    ];

    buses.forEach((bus, i) => {
      bus.marker = L.marker(selectedRoute.stops[bus.index].coords, {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
          iconSize: [35, 35],
        }),
      }).addTo(map);
      bus.marker.bindPopup(
        `Bus ${i + 1} → Next Stop: ${selectedRoute.stops[bus.index + 1]?.name || "Destination"}`
      );
    });

    // Move buses every 2 seconds and auto-pan map
    const interval = setInterval(() => {
      setBusStates((prev) => {
        const newStates = buses.map((bus) => {
          const nextIndex = (bus.index + 1) % selectedRoute.stops.length;
          bus.marker.setLatLng(selectedRoute.stops[nextIndex].coords);
          bus.marker.bindPopup(
            `Bus ${buses.indexOf(bus) + 1} → Next Stop: ${
              selectedRoute.stops[nextIndex].name
            }`
          );

          // Auto-pan map to follow the bus
          map.panTo(selectedRoute.stops[nextIndex].coords, { animate: true });

          return { ...bus, index: nextIndex };
        });
        return newStates;
      });
    }, 2000);

    // Initialize busStates
    setBusStates(buses.map((bus) => ({ ...bus })));

    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, [selectedRoute]);

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="sidebar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className={`route ${
              selectedRoute && selectedRoute.id === route.id
                ? "active-route"
                : ""
            }`}
            onClick={() => setSelectedRoute(route)}
          >
            {route.name}
          </div>
        ))}

        {/* Bus info */}
        {selectedRoute && busStates.length > 0 && (
          <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
            {busStates.map((bus, i) => {
              const stopsRemaining =
                selectedRoute.stops.length - bus.index - 1;
              const nextStop =
                selectedRoute.stops[bus.index + 1]
                  ? selectedRoute.stops[bus.index + 1].name
                  : "Destination";
              return (
                <div key={i}>
                  Bus {i + 1}: Current Stop: {selectedRoute.stops[bus.index].name} | Next Stop: {nextStop} | ETA to Destination:{" "}
                  {stopsRemaining * 2} min
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="map-container" id="map"></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
