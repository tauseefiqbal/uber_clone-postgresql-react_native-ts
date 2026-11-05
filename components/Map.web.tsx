import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { defaultDrivers } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { setDrivers } = useDriverStore();

  const { data: drivers } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const activeDrivers =
      Array.isArray(drivers) && drivers.length > 0 ? drivers : defaultDrivers;
    const baseLat = userLatitude ?? 37.78825;
    const baseLng = userLongitude ?? -122.4324;

    const newMarkers = generateMarkersFromData({
      data: activeDrivers,
      userLatitude: baseLat,
      userLongitude: baseLng,
    });

    setMarkers(newMarkers);
    setDrivers(newMarkers);
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== null &&
      destinationLatitude !== undefined &&
      destinationLongitude !== null &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude: userLatitude ?? 37.78825,
        userLongitude: userLongitude ?? -122.4324,
        destinationLatitude,
        destinationLongitude,
      }).then((updatedDrivers) => {
        if (Array.isArray(updatedDrivers) && updatedDrivers.length > 0) {
          setDrivers(updatedDrivers as MarkerData[]);
        }
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  const embedUrl =
    destinationLatitude && destinationLongitude && userLatitude && userLongitude
      ? `https://maps.google.com/maps?saddr=${userLatitude},${userLongitude}&daddr=${destinationLatitude},${destinationLongitude}&output=embed`
      : `https://maps.google.com/maps?q=${region.latitude},${region.longitude}&z=14&output=embed`;

  return (
    <View
      style={styles.container}
      className="w-full h-full rounded-2xl overflow-hidden"
    >
      {React.createElement("iframe", {
        src: embedUrl,
        style: {
          border: 0,
          width: "100%",
          height: "100%",
          borderRadius: 16,
        },
        loading: "lazy",
        allowFullScreen: true,
      })}
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
  },
});

export default Map;
