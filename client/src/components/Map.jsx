import { useEffect, useRef, useState } from "react";

export default function Map({
  retailers,
  selected,
  searchRegion,
  onClearSelected,
  onSelect,
}) {
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const geocoderRef = useRef(null);

  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const openInfoRef = useRef(null);
  const markersRef = useRef([]);
  const firstBoundsDoneRef = useRef(false);
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const relayoutAnd = (map, cb) => {
    if (typeof map.relayout === "function") map.relayout();
    setTimeout(cb, 0);
  };

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_API_KEY
    }&autoload=false&libraries=clusterer,services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setSdkLoaded(true));
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkLoaded || mapRef.current) return;

    const container = document.getElementById("map");
    const map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(36.5, 127.8),
      level: 13,
    });
    mapRef.current = map;

    clustererRef.current = new window.kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 7,
    });

    geocoderRef.current = new window.kakao.maps.services.Geocoder();

    if (onClearSelected) {
      window.kakao.maps.event.addListener(map, "click", () => onClearSelected());
    }

    window.addEventListener("resize", () => relayoutAnd(map, () => {}));
    setMapReady(true);
  }, [sdkLoaded, onClearSelected]);

  useEffect(() => {
    if (!searchRegion) firstBoundsDoneRef.current = false;
  }, [searchRegion]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    if (openInfoRef.current) {
      openInfoRef.current.close();
      openInfoRef.current = null;
    }

    clustererRef.current.clear();
    markersRef.current = [];

    const markers = (retailers || []).map((s) => {
      const lat = Number(s.위도);
      const lng = Number(s.경도);
      const pos = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({ position: pos });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (onSelect) onSelect(s);
      });

      markersRef.current.push({ lat, lng, marker, raw: s });
      return marker;
    });

    clustererRef.current.addMarkers(markers);

    if (selectedRef.current) return;

    if (searchRegion && geocoderRef.current) {
      const q = searchRegion.trim();
      if (q) {
        geocoderRef.current.addressSearch(q, (res, status) => {
          if (selectedRef.current) return;

          if (status === window.kakao.maps.services.Status.OK && res.length > 0) {
            const { x, y, address_name } = res[0];
            const center = new window.kakao.maps.LatLng(Number(y), Number(x));
            const level =
              /[동읍면리]($| )/.test(address_name) ? 6 :
              /구/.test(address_name)               ? 7 : 8;

            relayoutAnd(map, () => {
              if (selectedRef.current) return;
              map.setLevel(level);
              map.setCenter(center);
            });
            return;
          }

          if (!searchRegion) firstBoundsDoneRef.current = false;
        });
        return;
      }
    }

    if (!searchRegion && !firstBoundsDoneRef.current && markers.length > 0) {
      firstBoundsDoneRef.current = true;
      const all = new window.kakao.maps.LatLngBounds();
      markers.forEach((m) => all.extend(m.getPosition()));
      relayoutAnd(map, () => map.setBounds(all));
      return;
    }

    relayoutAnd(map, () => {
      map.setLevel(13);
      map.setCenter(new window.kakao.maps.LatLng(36.5, 127.8));
    });
  }, [mapReady, retailers, searchRegion, onSelect]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    if (openInfoRef.current) {
      openInfoRef.current.close();
      openInfoRef.current = null;
    }

    if (!selected) return;

    const lat = Number(selected.위도);
    const lng = Number(selected.경도);
    const pos = new window.kakao.maps.LatLng(lat, lng);

    const marker = new window.kakao.maps.Marker({
      position: pos,
      map,
      clickable: true,
    });

    if (onSelect) {
      window.kakao.maps.event.addListener(marker, "click", () => {
        onSelect(selected); 
      });
    }

    const info = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:6px;font-size:13px;">
        ${selected.상호명}<br/>
        ${selected.소재지}<br/>
        (${selected.count}회)
      </div>`,
      removable: true,
    });
    info.open(map, marker);
    openInfoRef.current = info;

    relayoutAnd(map, () => {
      map.setLevel(5);
      map.setCenter(pos);
    });
  }, [selected, mapReady, onSelect]);

  return <div id="map" style={{ width: "100%", height: "100%" }} />;
}