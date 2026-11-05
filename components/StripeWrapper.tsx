import { StripeProvider } from "@stripe/stripe-react-native";
import React from "react";

const StripeWrapper = ({ children }: { children: React.ReactElement }) => {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      {children}
    </StripeProvider>
  );
};

export default StripeWrapper;

