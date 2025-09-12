import { useEffect, useRef } from "react";

export default function Map({ retailers, selected }) {
    const mapRef = useRef(null);
    const clustererRef = useRef(null);

    useEffect(() => {
        if (!window.kakao || !window.kakao.maps) {
            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
                import.meta.env.VITE_KAKAO_API_KEY
            }&autoload=false&libraries=clusterer,services`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(initMap);
            };
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, []);

    // 지도 최초 초기화
    const initMap = () => {
        if (mapRef.current) return; // 이미 초기화 했으면 무시

        const container = document.getElementById("map");
        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 서울
            level: 7,
        };

        mapRef.current = new window.kakao.maps.Map(container, options);
        clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map: mapRef.current,
            averageCenter: true,
            minLevel: 5,
        });
    };

    // retailers / selected가 바뀔 때 마커 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // 기존 클러스터러 마커 제거
        clustererRef.current.clear();

        if (selected) {
            // 선택된 판매점만 표시
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(selected.위도, selected.경도),
                map,
            });

            const info = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:6px;font-size:13px;">${selected.상호명}<br/>(${selected.count}회)</div>`,
            });

            info.open(map, marker);
            map.setCenter(new window.kakao.maps.LatLng(selected.위도, selected.경도));
            map.setLevel(3);
        } else {
            // 전체 클러스터링
            const markers = retailers.map((shop) => {
                const marker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(shop.위도, shop.경도),
                });

                const info = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:6px;font-size:13px;">${shop.상호명}<br/>(${shop.count}회)</div>`,
                });

                window.kakao.maps.event.addListener(marker, "click", () => {
                    info.open(map, marker);
                });

                return marker;
            });

            clustererRef.current.addMarkers(markers);
        }
    }, [retailers, selected]);

    return <div id="map" style={{ width: "100%", height: "100%" }} />;
}