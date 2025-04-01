import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from "react";
import { STRIPE_PK } from "@/config";
import { StripeProvider } from "@stripe/stripe-react-native"

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <StripeProvider publishableKey={STRIPE_PK}>
      <Tabs >
        <Tabs.Screen name="index" options={{ 
          href: null,
          tabBarStyle: { display: "none"} }} 
        />
        <Tabs.Screen name="splashPage" options={{ 
          title: "Splash",
          href: null,
          tabBarStyle: { display: "none"} }} 
        />
        <Tabs.Screen name="account/loginPage" options={{ 
          title: "Login",
          href: null,
          tabBarStyle: { display: "none"} }} 
        />
        <Tabs.Screen name="account/createUser" options={{ 
          title: "Create Account",
          href: null,
          tabBarStyle: { display: "none"} }} 
        />
        <Tabs.Screen name="parking/favorites" options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="star" color={color} />
        }}
        />
        <Tabs.Screen name="home" options={{ 
          title: "Home", 
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
          }} 
        />
        <Tabs.Screen name="account/accountDetails" options={{ 
          title: "Account Details",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} /> 
        }} 
        />
        <Tabs.Screen name="resultsPage" options={{ 
          title: "Results",  
          headerShown: true,
          href: null, // This prevents it from being a tab destination
          tabBarStyle: { display: "none" } // Hide the tab bar on this screen
        }} 
        />
        <Tabs.Screen name="parking/reservations" options={{
          title: "Reserve a Spot",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-check-o" color={color} />
        }}
        />  
        <Tabs.Screen name="checkout/paymentInfo" options={{
          title: "Payment Info",
          href: null,
        }}
        />
        <Tabs.Screen name="checkout/confirmReservation" options={{
          title: "Confirm Reservation",
          href: null,
        }}
        />
      </Tabs>
    </StripeProvider>
    );
}