import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function GameMap() {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden">

      <MapContainer
        center={[-3.7319, -38.5267]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* EVENTO 1 */}
        <Marker position={[-3.7319, -38.5267]}>
          <Popup>
            🎮 Evento Gamer <br />
            Hoje • 19h
          </Popup>
        </Marker>

        {/* EVENTO 2 */}
        <Marker position={[-3.745, -38.51]}>
          <Popup>
            ☕ Café Meetup
          </Popup>
        </Marker>

        {/* EVENTO 3 */}
        <Marker position={[-3.72, -38.54]}>
          <Popup>
            🎵 Indie Night
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  );
}