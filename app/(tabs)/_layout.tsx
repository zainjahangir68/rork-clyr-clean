import { Tabs } from "expo-router";
import { Home, BookOpen, Award, User, Zap } from "lucide-react-native";
import React from "react";
import ClyrTheme from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ClyrTheme.accent,
        tabBarInactiveTintColor: '#8A8A9D',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: ClyrTheme.primary,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingTop: 8,
          height: 65,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarLabel: "Challenges",
          tabBarIcon: ({ color }) => <Zap color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarLabel: "Learn",
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          tabBarLabel: "Rewards",
          tabBarIcon: ({ color }) => <Award color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
