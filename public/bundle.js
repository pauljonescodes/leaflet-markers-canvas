var MarkerCanvasModule = (function (exports, L, RBush) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var L__namespace = /*#__PURE__*/_interopNamespaceDefault(L);

  var MarkerCanvasLayer = L__namespace.Layer.extend({
      _map: null,
      _canvas: null,
      _context: null,
      _markers: new Array(),
      _markersTree: new RBush(),
      _positionsTree: new RBush(),
      _icons: {},
      addTo: function (map) {
          map.addLayer(this);
          return this;
      },
      getBounds: function () {
          var bounds = new L__namespace.LatLngBounds([0, 0], [0, 0]);
          this._markers.forEach(function (marker) {
              bounds.extend(marker.getLatLng());
          });
          return bounds;
      },
      redraw: function () {
          this._redraw(true);
      },
      clear: function () {
          this._positionsTree = new RBush();
          this._markersTree = new RBush();
          this._markers = [];
          this._redraw(true);
      },
      addMarker: function (marker) {
          var _a = this._addMarker(marker), markerBox = _a.markerBox, positionBox = _a.positionBox, isVisible = _a.isVisible;
          if (markerBox && isVisible) {
              this._markersTree.insert(markerBox);
          }
          if (positionBox) {
              this._positionsTree.insert(positionBox);
          }
      },
      addMarkers: function (markers) {
          var _this = this;
          var markerBoxes = [];
          var positionBoxes = [];
          markers.forEach(function (marker) {
              var _a = _this._addMarker(marker), markerBox = _a.markerBox, positionBox = _a.positionBox, isVisible = _a.isVisible;
              if (markerBox && isVisible) {
                  markerBoxes.push(markerBox);
              }
              if (positionBox) {
                  positionBoxes.push(positionBox);
              }
          });
          this._markersTree.load(markerBoxes);
          this._positionsTree.load(positionBoxes);
      },
      removeMarker: function (marker) {
          var latLng = marker.getLatLng();
          var isVisible = this._map.getBounds().contains(latLng);
          var positionBox = {
              minX: latLng.lng,
              minY: latLng.lat,
              maxX: latLng.lng,
              maxY: latLng.lat,
              marker: marker,
          };
          this._positionsTree.remove(positionBox, function (a, b) {
              return a.marker._leaflet_id === b.marker._leaflet_id;
          });
          if (isVisible) {
              this._redraw(true);
          }
      },
      removeMarkers: function (markers) {
          var _this = this;
          var hasChanged = false;
          markers.forEach(function (marker) {
              var latLng = marker.getLatLng();
              var isVisible = _this._map.getBounds().contains(latLng);
              var positionBox = {
                  minX: latLng.lng,
                  minY: latLng.lat,
                  maxX: latLng.lng,
                  maxY: latLng.lat,
                  marker: marker,
              };
              _this._positionsTree.remove(positionBox, function (a, b) {
                  return (a.marker._leaflet_id === b.marker._leaflet_id);
              });
              if (isVisible) {
                  hasChanged = true;
              }
          });
          if (hasChanged) {
              this._redraw(true);
          }
      },
      initialize: function (options) {
          L__namespace.Util.setOptions(this, options);
      },
      onAdd: function (map) {
          this._map = map;
          this._initCanvas();
          this.getPane().appendChild(this._canvas);
          map.on('moveend', this._reset, this);
          map.on('resize', this._reset, this);
          map.on('click', this._fire, this);
          map.on('mousemove', this._fire, this);
          // if (map._zoomAnimated) {
          //   map.on('zoomanim', this._animateZoom, this);
          // }
      },
      onRemove: function (map) {
          this.getPane().removeChild(this._canvas);
          map.off('click', this._fire, this);
          map.off('mousemove', this._fire, this);
          map.off('moveend', this._reset, this);
          map.off('resize', this._reset, this);
          // if (map._zoomAnimated) {
          //   map.off('zoomanim', this._animateZoom, this);
          // }
      },
      setOptions: function (options) {
          L__namespace.Util.setOptions(this, options);
          return this.redraw();
      },
      _initCanvas: function () {
          var _a = this._map.getSize(), x = _a.x, y = _a.y;
          var isAnimated = this._map.options.zoomAnimation && L__namespace.Browser.any3d;
          this._canvas = L__namespace.DomUtil.create('canvas', 'leaflet-markers-canvas-layer leaflet-layer');
          this._canvas.width = x;
          this._canvas.height = y;
          this._context = this._canvas.getContext('2d');
          L__namespace.DomUtil.addClass(this._canvas, "leaflet-zoom-".concat(isAnimated ? 'animated' : 'hide'));
      },
      _addMarker: function (marker) {
          if (marker.options.pane !== 'markerPane' || !marker.options.icon) {
              console.error('This is not a marker', marker);
              return { markerBox: null, positionBox: null, isVisible: null };
          }
          // required for pop-up and tooltip
          marker._map = this._map;
          // add _leaflet_id property
          L__namespace.Util.stamp(marker);
          var latLng = marker.getLatLng();
          var isVisible = this._map.getBounds().contains(latLng);
          var _a = this._map.latLngToContainerPoint(latLng), x = _a.x, y = _a.y;
          var _b = marker.options.icon.options, iconSize = _b.iconSize, iconAnchor = _b.iconAnchor;
          var markerBox = {
              minX: x - iconAnchor[0],
              minY: y - iconAnchor[1],
              maxX: x + iconSize[0] - iconAnchor[0],
              maxY: y + iconSize[1] - iconAnchor[1],
              marker: marker,
          };
          var positionBox = {
              minX: latLng.lng,
              minY: latLng.lat,
              maxX: latLng.lng,
              maxY: latLng.lat,
              marker: marker,
          };
          if (isVisible) {
              this._drawMarker(marker, { x: x, y: y });
          }
          this._markers.push(marker);
          return { markerBox: markerBox, positionBox: positionBox, isVisible: isVisible };
      },
      _drawMarker: function (marker, _a) {
          var _this = this;
          var _b;
          var x = _a.x, y = _a.y;
          var iconUrl = ((_b = marker.options.icon) === null || _b === void 0 ? void 0 : _b.options).iconUrl;
          if (marker.image) {
              this._drawImage(marker, { x: x, y: y });
          }
          else if (this._icons[iconUrl]) {
              marker.image = this._icons[iconUrl].image;
              if (this._icons[iconUrl].isLoaded) {
                  this._drawImage(marker, { x: x, y: y });
              }
              else {
                  this._icons[iconUrl].elements.push({ marker: marker, x: x, y: y });
              }
          }
          else {
              var image = new Image();
              image.src = iconUrl;
              marker.image = image;
              this._icons[iconUrl] = {
                  image: image,
                  isLoaded: false,
                  elements: [{ marker: marker, x: x, y: y }],
              };
              image.onload = function () {
                  _this._icons[iconUrl].isLoaded = true;
                  _this._icons[iconUrl].elements.forEach(function (_a) {
                      var marker = _a.marker, x = _a.x, y = _a.y;
                      _this._drawImage(marker, { x: x, y: y });
                  });
              };
          }
      },
      _drawImage: function (marker, _a) {
          var _b;
          var x = _a.x, y = _a.y;
          var _c = (_b = marker.options.icon) === null || _b === void 0 ? void 0 : _b.options, rotationAngle = _c.rotationAngle, iconAnchor = _c.iconAnchor, iconSize = _c.iconSize;
          var angle = rotationAngle || 0;
          this._context.save();
          this._context.translate(x, y);
          this._context.rotate((angle * Math.PI) / 180);
          this._context.drawImage(marker.image, -iconAnchor[0], -iconAnchor[1], iconSize[0], iconSize[1]);
          this._context.restore();
      },
      _redraw: function (clear) {
          var _this = this;
          if (clear) {
              this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
          }
          if (!this._map || !this._positionsTree)
              return;
          var mapBounds = this._map.getBounds();
          var mapBoundsBox = {
              minX: mapBounds.getWest(),
              minY: mapBounds.getSouth(),
              maxX: mapBounds.getEast(),
              maxY: mapBounds.getNorth(),
          };
          // draw only visible markers
          var markers = [];
          this._positionsTree
              .search(mapBoundsBox)
              .forEach(function (_a) {
              var _b;
              var marker = _a.marker;
              var latLng = marker.getLatLng();
              var _c = _this._map.latLngToContainerPoint(latLng), x = _c.x, y = _c.y;
              var _d = (_b = marker.options.icon) === null || _b === void 0 ? void 0 : _b.options, iconSize = _d.iconSize, iconAnchor = _d.iconAnchor;
              var markerBox = {
                  minX: x - iconAnchor[0],
                  minY: y - iconAnchor[1],
                  maxX: x + iconSize[0] - iconAnchor[0],
                  maxY: y + iconSize[1] - iconAnchor[1],
                  marker: marker,
              };
              markers.push(markerBox);
              _this._drawMarker(marker, { x: x, y: y });
          });
          this._markersTree.clear();
          this._markersTree.load(markers);
      },
      _reset: function () {
          var topLeft = this._map.containerPointToLayerPoint([0, 0]);
          L__namespace.DomUtil.setPosition(this._canvas, topLeft);
          var _a = this._map.getSize(), x = _a.x, y = _a.y;
          this._canvas.width = x;
          this._canvas.height = y;
          this._redraw();
      },
      _fire: function (event) {
          if (!this._markersTree)
              return;
          var _a = event.containerPoint, x = _a.x, y = _a.y;
          var markers = this._markersTree.search({
              minX: x,
              minY: y,
              maxX: x,
              maxY: y,
          });
          if (markers && markers.length) {
              this._map._container.style.cursor = 'pointer';
              var marker = markers[0].marker;
              if (event.type === 'click') {
                  if (marker.listens('click')) {
                      marker.fire('click');
                  }
              }
              if (event.type === 'mousemove') {
                  if (this._mouseOverMarker && this._mouseOverMarker !== marker) {
                      if (this._mouseOverMarker.listens('mouseout')) {
                          this._mouseOverMarker.fire('mouseout');
                      }
                  }
                  if (!this._mouseOverMarker || this._mouseOverMarker !== marker) {
                      this._mouseOverMarker = marker;
                      if (marker.listens('mouseover')) {
                          marker.fire('mouseover');
                      }
                  }
              }
          }
          else {
              this._map._container.style.cursor = '';
              if (event.type === 'mousemove' && this._mouseOverMarker) {
                  if (this._mouseOverMarker.listens('mouseout')) {
                      this._mouseOverMarker.fire('mouseout');
                  }
                  delete this._mouseOverMarker;
              }
          }
      },
      _animateZoom: function (event) {
          var scale = this._map.getZoomScale(event.zoom);
          var offset = this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), event.zoom, event.center).min;
          L__namespace.DomUtil.setTransform(this._canvas, offset, scale);
      },
  });

  exports.MarkerCanvasLayer = MarkerCanvasLayer;

  return exports;

})({}, L, RBush);
