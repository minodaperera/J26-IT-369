import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import districtData from '../data/srilanka-districts.json';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const districtCoordinates = {
  COLOMBO: [6.9271, 79.8612],
  GAMPAHA: [7.084, 79.9925],
  KALUTARA: [6.5854, 79.9607],
  KANDY: [7.2906, 80.6337],
  MATALE: [7.4675, 80.6234],
  'NUWARA ELIYA': [6.9497, 80.7891],
  GALLE: [6.0535, 80.221],
  MATARA: [5.9549, 80.555],
  HAMBANTOTA: [6.1429, 81.1212],
  JAFFNA: [9.6615, 80.0255],
  KILINOCHCHI: [9.3803, 80.377],
  MANNAR: [8.981, 79.9044],
  VAVUNIYA: [8.7514, 80.4971],
  MULLAITTIVU: [9.2671, 80.8143],
  BATTICALOA: [7.731, 81.6747],
  AMPARA: [7.2812, 81.6747],
  TRINCOMALEE: [8.5874, 81.2152],
  KURUNEGALA: [7.4863, 80.3623],
  PUTTALAM: [8.0362, 79.8283],
  ANURADHAPURA: [8.3114, 80.4037],
  POLONNARUWA: [7.9403, 81.0188],
  BADULLA: [6.9934, 81.055],
  MONERAGALA: [6.8714, 81.3487],
  RATNAPURA: [6.6828, 80.4016],
  KEGALLE: [7.2513, 80.3464],
};

const SRI_LANKA_CENTER = [7.8731, 80.7718];

const districtColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#14B8A6'
];

const MapViewController = ({ selectedDistrict, focusAgency }) => {
  const map = useMap();

  useEffect(() => {
    if (focusAgency && focusAgency.latitude && focusAgency.longitude) {
      map.flyTo([focusAgency.latitude, focusAgency.longitude], 14, { duration: 1.5 });
    } else if (selectedDistrict && districtCoordinates[selectedDistrict.toUpperCase()]) {
      const coords = districtCoordinates[selectedDistrict.toUpperCase()];
      map.flyTo(coords, 11, { duration: 1.5 });
    } else {
      map.flyTo(SRI_LANKA_CENTER, 7, { duration: 1.5 });
    }
  }, [selectedDistrict, focusAgency, map]);

  return null;
};

export const AgencyMap = ({ agencies = [], selectedDistrict, focusAgency, onSelectDistrict }) => {
  const handleOpenGoogleDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const getStyle = (feature) => {
    const name = feature?.properties?.name || feature?.properties?.NAME_1 || '';
    const isSelected = selectedDistrict && name.toUpperCase() === selectedDistrict.toUpperCase();

    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = districtColors[charCodeSum % districtColors.length];

    return {
      fillColor: isSelected ? '#EF4444' : color,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#B91C1C' : '#FFFFFF',
      fillOpacity: isSelected ? 0.6 : 0.35,
    };
  };

  const onEachFeature = (feature, layer) => {
    const districtName = feature?.properties?.name || feature?.properties?.NAME_1 || '';

    layer.on({
      click: () => {
        if (onSelectDistrict && districtName) {
          onSelectDistrict(districtName.toUpperCase());
        }
      },
    });
  };

  return (
    <div style={{ width: '100%', height: '520px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController selectedDistrict={selectedDistrict} focusAgency={focusAgency} />

        <GeoJSON
          data={districtData}
          style={getStyle}
          onEachFeature={onEachFeature}
        />

        {agencies.map((agency) => {
          if (!agency.latitude || !agency.longitude) return null;

          return (
            <Marker
              key={agency._id}
              position={[agency.latitude, agency.longitude]}
            >
              <Popup>
                <div style={{ padding: '4px', maxWidth: '220px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#542d1e' }}>{agency.agencyName}</h3>
                  <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#666' }}><strong>License:</strong> {agency.licenseNo}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666' }}><strong>Address:</strong> {agency.address}</p>
                  {agency.telephone && (
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#666' }}><strong>Tel:</strong> {agency.telephone}</p>
                  )}
                  <button
                    onClick={() => handleOpenGoogleDirections(agency.latitude, agency.longitude)}
                    style={{ width: '100%', backgroundColor: '#542d1e', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    🚗 Navigation Route (Google Maps)
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};