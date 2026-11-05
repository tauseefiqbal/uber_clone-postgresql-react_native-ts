import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

const decodePolyline = (
  encoded: string,
): { latitude: number; longitude: number }[] => {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

const fetchRouteFromRoutesApi = async ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  fieldMask,
}: {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  fieldMask: string;
}) => {
  if (!directionsAPI) {
    return null;
  }

  const routeRequest = {
    origin: {
      location: {
        latLng: {
          latitude: originLatitude,
          longitude: originLongitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        },
      },
    },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE_OPTIMAL",
    languageCode: "en-US",
  };

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": directionsAPI,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(routeRequest),
    },
  );

  if (!response.ok) {
    throw new Error(`Routes API error: ${response.status}`);
  }

  const data = await response.json();
  return data.routes?.[0] ?? null;
};

export const getRouteCoordinates = async ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}): Promise<{ latitude: number; longitude: number }[]> => {
  try {
    const route = await fetchRouteFromRoutesApi({
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      fieldMask: "routes.polyline.encodedPolyline",
    });

    const encodedPolyline = route?.polyline?.encodedPolyline;
    if (!encodedPolyline) {
      return [];
    }

    return decodePolyline(encodedPolyline);
  } catch (error) {
    console.warn("Error fetching route coordinates from Routes API:", error);
    return [];
  }
};

const estimateDurationSeconds = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  // Assume ~40 km/h average city speed, minimum 180 seconds (3 min)
  return Math.max(Math.round((distanceKm / 40) * 3600), 180);
};

const getRouteDurationSeconds = async ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}) => {
  try {
    const route = await fetchRouteFromRoutesApi({
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      fieldMask: "routes.duration",
    });

    const durationValue = route?.duration ?? "0s";
    const parsed = Number.parseFloat(durationValue.replace(/s$/, "")) || 0;
    if (parsed > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn("Error fetching route duration from Routes API:", error);
  }

  return estimateDurationSeconds(
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  );
};

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver, index) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const defaultTime = 8 + index * 2;
    const defaultPrice = (defaultTime * 0.5).toFixed(2);

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      time: defaultTime,
      price: defaultPrice,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timeToDestination = await getRouteDurationSeconds({
      originLatitude: userLatitude,
      originLongitude: userLongitude,
      destinationLatitude,
      destinationLongitude,
    });

    const timesPromises = markers.map(async (marker) => {
      const timeToUser = await getRouteDurationSeconds({
        originLatitude: marker.latitude,
        originLongitude: marker.longitude,
        destinationLatitude: userLatitude,
        destinationLongitude: userLongitude,
      });

      const totalTime = (timeToUser + timeToDestination) / 60;
      const price = (totalTime * 0.5).toFixed(2);

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};
