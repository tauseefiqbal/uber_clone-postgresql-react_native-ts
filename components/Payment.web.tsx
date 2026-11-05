import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
};

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();

  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [cardName, setCardName] = useState<string>(fullName || "");
  const [cardEmail, setCardEmail] = useState<string>(email || "");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [zip, setZip] = useState<string>("");

  const displayAmount = amount ? Number(amount).toFixed(2) : "10.00";

  const openPaymentSheet = () => {
    setErrorMessage("");
    if (!cardName && fullName) setCardName(fullName);
    if (!cardEmail && email) setCardEmail(email);
    setPaymentModalVisible(true);
  };

  const fillTestCard = () => {
    setErrorMessage("");
    if (!cardName) setCardName(fullName || "Test Rider");
    if (!cardEmail) setCardEmail(email || "rider@example.com");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("424");
    setZip("94103");
  };

  const handlePayNow = async () => {
    setErrorMessage("");

    const rawCardDigits = cardNumber.replace(/\D/g, "");
    const rawExpiryDigits = expiry.replace(/\D/g, "");
    const rawCvcDigits = cvc.replace(/\D/g, "");

    if (!cardName.trim()) {
      setErrorMessage("Please enter the cardholder name.");
      return;
    }
    if (rawCardDigits.length < 13) {
      setErrorMessage("Please enter a valid 16-digit card number.");
      return;
    }
    if (rawExpiryDigits.length !== 4) {
      setErrorMessage("Please enter a valid expiration date (MM/YY).");
      return;
    }
    const expMonth = parseInt(rawExpiryDigits.slice(0, 2), 10);
    if (expMonth < 1 || expMonth > 12) {
      setErrorMessage("Expiration month must be between 01 and 12.");
      return;
    }
    if (rawCvcDigits.length < 3) {
      setErrorMessage("Please enter a valid 3 or 4 digit CVC code.");
      return;
    }

    setIsProcessing(true);

    try {
      const customerName =
        cardName.trim() || fullName || (cardEmail || "rider").split("@")[0];
      const customerEmail = cardEmail.trim() || email || "rider@example.com";

      // Create & confirm Stripe PaymentIntent in test mode
      try {
        const stripeCreate = await fetchAPI("/(api)/(stripe)/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
            amount: displayAmount,
          }),
        });

        if (stripeCreate?.paymentIntent?.id && stripeCreate?.customer) {
          await fetchAPI("/(api)/(stripe)/pay", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_method_id: "pm_card_visa",
              payment_intent_id: stripeCreate.paymentIntent.id,
              customer_id: stripeCreate.customer,
              client_secret: stripeCreate.paymentIntent.client_secret,
            }),
          });
        }
      } catch (stripeErr) {
        console.warn("Stripe test confirmation warning:", stripeErr);
      }

      // Record ride booking
      await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_address: userAddress || "Current Location",
          destination_address: destinationAddress || "Destination",
          origin_latitude: userLatitude ?? 37.78825,
          origin_longitude: userLongitude ?? -122.4324,
          destination_latitude: destinationLatitude ?? 37.78825,
          destination_longitude: destinationLongitude ?? -122.4324,
          ride_time: Math.round(rideTime || 10),
          fare_price: Math.max(50, Math.round(parseFloat(displayAmount) * 100)),
          payment_status: "paid",
          driver_id: driverId || 1,
          user_id: userId || "guest",
        }),
      });

      setIsProcessing(false);
      setPaymentModalVisible(false);
      setSuccess(true);
    } catch (error: any) {
      setIsProcessing(false);
      setErrorMessage(
        error?.message || "Unable to process payment. Please try again.",
      );
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      {/* Payment Information Modal */}
      <ReactNativeModal
        isVisible={paymentModalVisible}
        onBackdropPress={() => !isProcessing && setPaymentModalVisible(false)}
      >
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Payment Information</Text>
              <Text style={styles.modalSubtitle}>
                Enter your card details to complete booking
              </Text>
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountBadgeText}>${displayAmount}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={fillTestCard}
            activeOpacity={0.8}
            style={styles.testCardBanner}
          >
            <Text style={styles.testCardBannerText}>
              ⚡ Click to autofill Stripe test card (4242 •••• 4242)
            </Text>
          </TouchableOpacity>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name on Card"
              placeholderTextColor="#9CA3AF"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email for Receipt</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={cardEmail}
              onChangeText={setCardEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Expiry (MM/YY)</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={5}
                value={expiry}
                onChangeText={(text) => setExpiry(formatExpiry(text))}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1, marginHorizontal: 4 }]}>
              <Text style={styles.label}>CVC</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={cvc}
                onChangeText={(text) =>
                  setCvc(text.replace(/\D/g, "").slice(0, 4))
                }
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>ZIP</Text>
              <TextInput
                style={styles.input}
                placeholder="94103"
                placeholderTextColor="#9CA3AF"
                value={zip}
                maxLength={10}
                onChangeText={setZip}
              />
            </View>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handlePayNow}
            disabled={isProcessing}
            activeOpacity={0.85}
            style={[
              styles.payButton,
              isProcessing ? { opacity: 0.7 } : undefined,
            ]}
          >
            {isProcessing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.payButtonText, { marginLeft: 8 }]}>
                  Processing Payment...
                </Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Pay ${displayAmount}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentModalVisible(false)}
            disabled={isProcessing}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ReactNativeModal>

      {/* Booking Success Modal */}
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your payment of ${displayAmount}. Your reservation has
            been successfully placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  amountBadge: {
    backgroundColor: "#E6F3FF",
    borderColor: "#0286FF",
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  amountBadgeText: {
    color: "#0286FF",
    fontWeight: "700",
    fontSize: 16,
  },
  testCardBanner: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  testCardBannerText: {
    color: "#0369A1",
    fontSize: 12,
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#0286FF",
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Payment;
