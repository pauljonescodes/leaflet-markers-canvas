import * as L from 'leaflet';
export interface MarkerCanvasLayerType extends L.Layer {
    getBounds(): L.LatLngBounds;
    redraw(): void;
    clear(): void;
    addMarker(marker: L.Marker): void;
    addMarkers(markers: L.Marker[]): void;
    removeMarker(marker: L.Marker): void;
    removeMarkers(markers: L.Marker[]): void;
}
export declare const MarkerCanvasLayer: {
    new (): MarkerCanvasLayerType;
};
