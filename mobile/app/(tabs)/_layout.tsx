import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "hsl(var(--primary))",
        tabBarInactiveTintColor: "hsl(var(--muted-foreground))",
        tabBarStyle: {
          backgroundColor: "hsl(var(--background))",
          borderTopColor: "hsl(var(--border))",
        },
        headerStyle: {
          backgroundColor: "hsl(var(--background))",
          borderBottomColor: "hsl(var(--border))",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: "hsl(var(--foreground))",
          fontWeight: "bold",
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Communities',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
