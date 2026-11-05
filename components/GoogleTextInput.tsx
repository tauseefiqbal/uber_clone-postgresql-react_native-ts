import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const getPlaceSuggestions = async (input: string) => {
  if (!googlePlacesApiKey || input.trim().length < 2) {
    return [];
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googlePlacesApiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input,
        languageCode: "en",
      }),
    },
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.suggestions ?? [])
    .map((suggestion: any) => {
      const prediction = suggestion.placePrediction ?? {};
      const mainText =
        prediction.structuredFormat?.mainText?.text ??
        prediction.text?.text ??
        "";
      const secondaryText =
        prediction.structuredFormat?.secondaryText?.text ?? "";

      return {
        place_id: prediction.placeId ?? "",
        description: prediction.text?.text ?? mainText,
        displayText: secondaryText
          ? `${mainText} · ${secondaryText}`
          : mainText,
      };
    })
    .filter((item: any) => item.place_id && item.description);
};

const getPlaceDetails = async (placeId: string) => {
  if (!googlePlacesApiKey || !placeId) {
    return null;
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": googlePlacesApiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const location = data.location ?? {};

  return {
    latitude: location.latitude ?? 0,
    longitude: location.longitude ?? 0,
    address:
      data.formattedAddress ?? data.displayName?.text ?? "Selected location",
  };
};

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [value, setValue] = useState(initialLocation ?? "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  useEffect(() => {
    setShouldSearch(false);
    setValue(initialLocation ?? "");
  }, [initialLocation]);

  useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await getPlaceSuggestions(trimmedValue);
        setSuggestions(results);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [value, shouldSearch]);

  const handleChangeText = (text: string) => {
    setShouldSearch(true);
    setValue(text);
  };

  const handleSuggestionPress = async (suggestion: any) => {
    const details = await getPlaceDetails(suggestion.place_id);
    const selectedAddress = details?.address ?? suggestion.description;

    setShouldSearch(false);
    setValue(selectedAddress);
    setSuggestions([]);

    handlePress({
      latitude: details?.latitude ?? 0,
      longitude: details?.longitude ?? 0,
      address: selectedAddress,
    });
  };

  const handleSubmitEditing = async () => {
    if (suggestions.length > 0) {
      await handleSuggestionPress(suggestions[0]);
      return;
    }
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      const results = await getPlaceSuggestions(trimmed);
      if (results.length > 0) {
        await handleSuggestionPress(results[0]);
      }
    }
  };

  return (
    <View className={`relative z-50 rounded-xl ${containerStyle}`}>
      <View className="flex-row items-center justify-center rounded-xl">
        <View className="justify-center items-center w-10 h-10">
          <Image
            source={icon ? icon : icons.search}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </View>

        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="gray"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 h-12 pl-2 text-base font-JakartaMedium"
          style={{
            backgroundColor: textInputBackgroundColor ?? "white",
          }}
        />
      </View>

      {loading && (
        <View className="mt-2 rounded-lg bg-white px-3 py-2">
          <Text className="text-xs text-gray-500">Searching locations...</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <View className="mt-2 rounded-xl bg-white shadow-sm shadow-neutral-300 overflow-hidden">
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => handleSuggestionPress(item)}
              className="border-b border-neutral-200 px-3 py-3"
            >
              <Text className="text-sm font-JakartaMedium text-neutral-800">
                {item.displayText}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
