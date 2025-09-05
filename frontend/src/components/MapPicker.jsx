import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import locationPin from '../assets/location-pin.svg';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const pinIcon = new L.Icon({
  iconUrl: locationPin,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function MapPicker({ lat, lng, onChange }) {
  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange && onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return lat && lng ? <Marker position={[lat, lng]} icon={pinIcon} /> : null;
  }

  return (
    <MapContainer
      center={[lat || 0, lng || 0]}
      zoom={lat && lng ? 13 : 2}
      style={{ height: 250, width: '100%', borderRadius: 8, marginBottom: 12 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}
