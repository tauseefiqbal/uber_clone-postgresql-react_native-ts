import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const lastTapRef = useRef<{ id: number; time: number }>({ id: 0, time: 0 });

  useEffect(() => {
    if (!selectedDriver && Array.isArray(drivers) && drivers.length > 0) {
      setSelectedDriver(Number(drivers[0].id));
    }
  }, [drivers, selectedDriver, setSelectedDriver]);

  const handleDriverSelect = (driverId: number) => {
    const now = Date.now();
    const isDoubleTap =
      lastTapRef.current.id === driverId && now - lastTapRef.current.time < 400;
    lastTapRef.current = { id: driverId, time: now };

    setSelectedDriver(driverId);

    if (isDoubleTap) {
      router.push("/(root)/book-ride");
    }
  };

  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        extraData={selectedDriver}
        keyExtractor={(item, index) => (item.id ?? index).toString()}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => handleDriverSelect(Number(item.id!))}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => {
                if (!selectedDriver && drivers?.length > 0) {
                  setSelectedDriver(Number(drivers[0].id));
                }
                router.push("/(root)/book-ride");
              }}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
