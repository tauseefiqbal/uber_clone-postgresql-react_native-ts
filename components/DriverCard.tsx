import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore } from "@/store";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  const { setSelectedDriver } = useDriverStore();
  const isSelected = Number(selected) === Number(item.id);

  const handleBookDriver = () => {
    setSelectedDriver(Number(item.id));
    router.push("/(root)/book-ride");
  };

  return (
    <TouchableOpacity
      onPress={setSelected}
      activeOpacity={0.8}
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
      className={`${
        isSelected ? "bg-general-600" : "bg-white"
      } flex flex-row items-center justify-between py-5 px-3 rounded-xl mb-2`}
    >
      <Image
        source={{ uri: item.profile_image_url }}
        className="w-14 h-14 rounded-full"
      />

      <View className="flex-1 flex flex-col items-start justify-center mx-3">
        <View className="flex flex-row items-center justify-start mb-1">
          <Text className="text-lg font-JakartaRegular">{item.title}</Text>

          <View className="flex flex-row items-center space-x-1 ml-2">
            <Image source={icons.star} className="w-3.5 h-3.5" />
            <Text className="text-sm font-JakartaRegular">
              {item.rating ?? 4.8}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <View className="flex flex-row items-center">
            <Image source={icons.dollar} className="w-4 h-4" />
            <Text className="text-sm font-JakartaRegular ml-1">
              ${item.price ?? "5.00"}
            </Text>
          </View>

          <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {formatTime(Math.round(item.time || 10))}
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {item.car_seats} seats
          </Text>
        </View>
      </View>

      <View className="flex flex-col items-center justify-center">
        <Image
          source={{ uri: item.car_image_url }}
          className="h-12 w-14"
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={handleBookDriver}
          activeOpacity={0.8}
          style={styles.selectButton}
        >
          <Text style={styles.selectButtonText}>
            {isSelected ? "Selected ✓" : "Select"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  selectedCard: {
    backgroundColor: "#E6F3FF",
    borderColor: "#0286FF",
  },
  unselectedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "transparent",
  },
  selectButton: {
    backgroundColor: "#0286FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginTop: 4,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default DriverCard;
