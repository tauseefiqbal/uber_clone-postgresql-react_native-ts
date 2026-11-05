import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      const createdSignUp = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
      });

      if (createdSignUp.status === "complete") {
        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: form.name,
              email: form.email.trim(),
              clerkId: createdSignUp.createdUserId,
            }),
          });
        } catch (dbError) {
          console.warn("User DB creation error:", dbError);
        }

        await setActive({ session: createdSignUp.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;
      const errorMessage = err?.errors?.[0]?.longMessage ?? "";
      if (
        errorCode === "session_exists" ||
        errorMessage.toLowerCase().includes("already signed in")
      ) {
        router.replace("/(root)/(tabs)/home");
        return;
      }
      if (
        errorCode === "client_state_invalid" ||
        errorMessage.toLowerCase().includes("no sign up attempt was found")
      ) {
        if (signUp?.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
          router.replace("/(root)/(tabs)/home");
          return;
        }
      }
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", errorMessage || "Sign up failed. Please try again.");
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      if (signUp.status === "complete" && signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: form.name,
              email: form.email.trim(),
              clerkId: completeSignUp.createdUserId,
            }),
          });
        } catch (dbError) {
          console.warn("User DB creation error:", dbError);
        }
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.errors?.[0]?.longMessage ??
        "Verification failed. Please try again.";
      if (
        errorMessage.toLowerCase().includes("no sign up attempt was found") &&
        signUp?.createdSessionId
      ) {
        await setActive({ session: signUp.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }
      setVerification({
        ...verification,
        error: errorMessage,
        state: "failed",
      });
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          // onBackdropPress={() =>
          //   setVerification({ ...verification, state: "default" })
          // }
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;
