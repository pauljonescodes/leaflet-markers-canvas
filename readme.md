# Marker Canvas Layer

`npm run build`

Creates a bundle.js in /public suitable for browser execution.

`npm run serve`

Serves the example in /public

`npm run compile`

Creates JavaScript file suitable for execution in Node.js

## React

```typescript
import {useLeafletContext} from '@react-leaflet/core';
import {Marker as LeafletMarker} from 'leaflet';
import {MarkerCanvasLayer} from 'marker-canvas-layer'; 
import React, {
  FunctionComponent,
  ReactElement,
  ReactNode,
  useEffect,
} from 'react';
import {Marker, MarkerProps} from 'react-leaflet';

export const MarkerCanvasLayerContainer: FunctionComponent<{
  children?: ReactNode;
}> = ({children}) => {
  const context = useLeafletContext();

  useEffect(() => {
    const markerCanvasLayer = new MarkerCanvasLayer();
    markerCanvasLayer.addTo(context.map);
    React.Children.forEach(children, child => {
      if (isReactLeafletMarker(child)) {
        markerCanvasLayer.addMarker(
          new LeafletMarker(child.props.position, {icon: child.props.icon}),
        );
      }
    });
    return () => {
      markerCanvasLayer.removeFrom(context.map);
    };
  }, []);

  return null;
};

const isReactLeafletMarker = (
  element: ReactNode,
): element is ReactElement<MarkerProps> => {
  return React.isValidElement(element) && element.type === Marker;
};
```
