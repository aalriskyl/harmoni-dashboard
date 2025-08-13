import { useEffect } from "react";

const FloodLayer = ({ map, show, rainfall }) => {
  const sourceId = 'flood-data';
  const layerId = 'flood-layer';

  useEffect(() => {
    if (!map) return;

    const onSourceData = (e) => {
      if (e.sourceId === sourceId && e.isSourceLoaded) {
        window.dispatchEvent(new CustomEvent('floodLayerStateChange', { detail: { loading: false } }));
      }
    };

    const handleLayerClick = (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const { 
          WADMKK, WADMKC, WADMKD, 
          City, District, Sub_distri, 
          Year, Month, day_in_the,
          Min_height, Max_height, Avg_height,
          days_poole, kelurahan
        } = feature.properties;
        
        const { lng, lat } = e.lngLat;

        window.dispatchEvent(new CustomEvent('floodLayerClick', {
          detail: {
            lng,
            lat,
            WADMKC,
            WADMKD,
            WADMKK,
            kelurahan,
            City,
            District,
            Sub_distri,
            Year,
            Month,
            Min_height,
            Max_height,
            Avg_height,
            day_in_the,
            days_poole
          }
        }));
      }
    };

    const setupLayer = () => {
      if (map.getSource(sourceId)) return;

      window.dispatchEvent(new CustomEvent('floodLayerStateChange', { detail: { loading: true } }));
      map.on('sourcedata', onSourceData);

      map.addSource(sourceId, {
        type: 'geojson',
        data: '/data/Average_Flood_Depth_2024_EPSG_4326.geojson',
      });

      map.addLayer({
        id: layerId,
        type: 'fill-extrusion',
        source: sourceId,
        layout: { 'visibility': 'none' },
        paint: {
          'fill-extrusion-color': [
            'step',
            ['get', 'Avg_height'],
            '#afd1e7', 50, '#62a1cf', 100, '#3282b8', 150, '#1b6ca8', 200, '#0f4c75',
          ],
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0.7,
        },
      });

      map.on('click', layerId, handleLayerClick);
    };

    if (map.isStyleLoaded()) {
      setupLayer();
    } else {
      map.once('load', setupLayer);
    }

    return () => {
      if (map.isStyleLoaded()) {
        map.off('click', layerId, handleLayerClick);
        map.off('sourcedata', onSourceData);
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      }
    };
  }, [map]);

  useEffect(() => {
    console.log(`[FloodLayer] Updating layer with show: ${show}, rainfall: ${rainfall}`);
    if (!map || !map.getLayer(layerId)) {
      console.log('[FloodLayer] Guard clause triggered: map or layer not ready.');
      return;
    }

    const isVisible = show && rainfall > 0;
    console.log(`[FloodLayer] Setting visibility to: ${isVisible ? 'visible' : 'none'}`);
    map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');

    if (isVisible) {
      map.setPaintProperty(layerId, 'fill-extrusion-height', [
        'interpolate',
        ['linear'],
        ['get', 'Avg_height'],
        0, 0,
        300, ['*', ['get', 'Avg_height'], ['/', rainfall, 25]]
      ]);
    }
  }, [map, show, rainfall]);

  return null;
};

export default FloodLayer;
