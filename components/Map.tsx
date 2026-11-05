import Constants, { ExecutionEnvironment } from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
  getRouteCoordinates,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const geoapifyKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const useAndroidTileFallback =
  Platform.OS === "android" && isExpoGo && Boolean(geoapifyKey);

const latLngToPixel = (
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number,
) => {
  const scale = 256 * Math.pow(2, zoom);
  const project = (latitude: number, longitude: number) => {
    const siny = Math.min(
      Math.max(Math.sin((latitude * Math.PI) / 180), -0.9999),
      0.9999,
    );
    return {
      x: (0.5 + longitude / 360) * scale,
      y: (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)) * scale,
    };
  };

  const centerPoint = project(centerLat, centerLng);
  const targetPoint = project(lat, lng);

  return {
    x: width / 2 + (targetPoint.x - centerPoint.x),
    y: height / 2 + (targetPoint.y - centerPoint.y),
  };
};

const getZoomFromDelta = (latitudeDelta: number) => {
  const safeDelta = Math.max(latitudeDelta || 0.01, 0.002);
  const calculated = Math.round(Math.log2(360 / safeDelta)) - 1;
  return Math.min(Math.max(calculated, 3), 17);
};

const Map = () => {
  const mapRef = useRef<MapView | null>(null);
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [containerSize, setContainerSize] = useState({
    width: 350,
    height: 300,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((updatedDrivers) => {
        setDrivers(updatedDrivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude
    ) {
      setRouteCoordinates([]);
      return;
    }

    let isMounted = true;

    getRouteCoordinates({
      originLatitude: userLatitude,
      originLongitude: userLongitude,
      destinationLatitude,
      destinationLongitude,
    }).then((coordinates) => {
      if (isMounted) {
        setRouteCoordinates(coordinates);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  const [zoom, setZoom] = useState(() =>
    getZoomFromDelta(region.latitudeDelta),
  );

  useEffect(() => {
    setZoom(getZoomFromDelta(region.latitudeDelta));
    if (mapRef.current && (userLatitude || destinationLatitude)) {
      mapRef.current.animateToRegion(region, 500);
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({
        width: Math.round(width),
        height: Math.round(height),
      });
    }
  };

  if (useAndroidTileFallback) {
    const imgWidth = Math.min(Math.max(containerSize.width, 300), 800);
    const imgHeight = Math.min(Math.max(containerSize.height, 300), 800);
    const staticMapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=${imgWidth}&height=${imgHeight}&center=lonlat:${region.longitude},${region.latitude}&zoom=${zoom}&apiKey=${geoapifyKey}`;

    const userPixel =
      userLatitude && userLongitude
        ? latLngToPixel(
            userLatitude,
            userLongitude,
            region.latitude,
            region.longitude,
            zoom,
            containerSize.width,
            containerSize.height,
          )
        : null;

    const destinationPixel =
      destinationLatitude && destinationLongitude
        ? latLngToPixel(
            destinationLatitude,
            destinationLongitude,
            region.latitude,
            region.longitude,
            zoom,
            containerSize.width,
            containerSize.height,
          )
        : null;

    const sampledRoute =
      routeCoordinates.length > 40
        ? routeCoordinates.filter(
            (_, idx) =>
              idx % Math.ceil(routeCoordinates.length / 40) === 0 ||
              idx === routeCoordinates.length - 1,
          )
        : routeCoordinates;

    return (
      <View
        style={styles.container}
        className="w-full h-full rounded-2xl overflow-hidden"
        onLayout={handleLayout}
      >
        <Image
          source={{ uri: staticMapUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {sampledRoute.map((coord, idx) => {
          const pt = latLngToPixel(
            coord.latitude,
            coord.longitude,
            region.latitude,
            region.longitude,
            zoom,
            containerSize.width,
            containerSize.height,
          );
          if (
            pt.x < 0 ||
            pt.x > containerSize.width ||
            pt.y < 0 ||
            pt.y > containerSize.height
          ) {
            return null;
          }
          return (
            <View
              key={`route-pt-${idx}`}
              style={[
                styles.routeDot,
                {
                  left: pt.x - 3,
                  top: pt.y - 3,
                },
              ]}
            />
          );
        })}

        {userPixel && (
          <View
            style={[
              styles.userLocationOuter,
              {
                left: userPixel.x - 10,
                top: userPixel.y - 10,
              },
            ]}
          >
            <View style={styles.userLocationInner} />
          </View>
        )}

        {markers.map((marker) => {
          const pt = latLngToPixel(
            marker.latitude,
            marker.longitude,
            region.latitude,
            region.longitude,
            zoom,
            containerSize.width,
            containerSize.height,
          );
          if (
            pt.x < -20 ||
            pt.x > containerSize.width + 20 ||
            pt.y < -20 ||
            pt.y > containerSize.height + 20
          ) {
            return null;
          }
          return (
            <Image
              key={marker.id}
              source={
                selectedDriver === +marker.id
                  ? icons.selectedMarker
                  : icons.marker
              }
              style={[
                styles.markerIcon,
                {
                  left: pt.x - 14,
                  top: pt.y - 14,
                },
              ]}
              resizeMode="contain"
            />
          );
        })}

        {destinationPixel && (
          <Image
            source={icons.pin}
            style={[
              styles.pinIcon,
              {
                left: destinationPixel.x - 14,
                top: destinationPixel.y - 28,
              },
            ]}
            resizeMode="contain"
          />
        )}

        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => setZoom((z) => Math.min(z + 1, 18))}
          >
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => setZoom((z) => Math.max(z - 1, 3))}
          >
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      className="w-full h-full rounded-2xl overflow-hidden"
    >
      <MapView
        ref={mapRef}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={StyleSheet.absoluteFillObject}
        tintColor="black"
        mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
        showsPointsOfInterest={false}
        initialRegion={region}
        showsUserLocation={true}
        userInterfaceStyle="light"
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={
              selectedDriver === +marker.id
                ? icons.selectedMarker
                : icons.marker
            }
          />
        ))}

        {destinationLatitude && destinationLongitude && (
          <>
            <Marker
              key="destination"
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#0286FF"
                strokeWidth={3}
              />
            )}
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: 300,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  userLocationOuter: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(2, 134, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0286FF",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  markerIcon: {
    position: "absolute",
    width: 28,
    height: 28,
  },
  pinIcon: {
    position: "absolute",
    width: 28,
    height: 28,
  },
  routeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0286FF",
  },
  zoomControls: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  zoomButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  zoomText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
});

export default Map;
