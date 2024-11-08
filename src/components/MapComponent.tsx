import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface Location {
  lat: number;
  lng: number;
}

const MapComponent: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const center = {
    lat: 20.5937,
    lng: 78.9629,
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const getCoordinates = async (address: string): Promise<void> => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        setLocation({ lat, lng });
        setError(null);
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else {
        setError(data.status);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = () => {
    if (inputRef.current!.value.trim().length === 0) {
      return;
    } else {
      getCoordinates(inputRef.current!.value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="map-container">
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          className="styled-input"
          placeholder="Enter location..."
        />
        <button onClick={handleSubmit} className="styled-button">
          Search
        </button>
      </div>
      {error && <div className="error-message">Error: {error}</div>}
      <div className="map-wrapper">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={location || center}
            zoom={10}
            onLoad={onLoad}
          >
            {location && <Marker position={location} />}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapComponent;
