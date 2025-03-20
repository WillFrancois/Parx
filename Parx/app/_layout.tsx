import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from "react";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
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
      </Tabs>
    </>
    );
}