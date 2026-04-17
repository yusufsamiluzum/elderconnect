import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);

  // Consolidated form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    birthYear: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    if (isLogin) {
      console.log("Login:", { email: formData.email, password: formData.password });
    } else {
      console.log("Register:", formData);
    }
    
    // Navigate to root tab (Feed context)
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          {/* Header */}
          <View className="mb-8 items-center mt-8">
            <View className="w-16 h-16 bg-primary rounded-xl mb-4 items-center justify-center">
              <Text className="text-white text-3xl font-bold">E</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
            <Text className="text-muted-foreground mt-2 text-center text-lg">
              {isLogin ? "Sign in to your account to continue" : "Join our community today"}
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card border border-border p-6 rounded-xl shadow-sm mb-6">
            
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-foreground font-medium mb-1.5">Username</Text>
                <TextInput
                  value={formData.username}
                  onChangeText={(val) => handleChange("username", val)}
                  placeholder="Choose a username"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Email Address</Text>
              <TextInput
                value={formData.email}
                onChangeText={(val) => handleChange("email", val)}
                placeholder="your.email@example.com"
                placeholderTextColor="hsl(var(--muted-foreground))"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
              />
            </View>

            {!isLogin && (
              <View className="mb-4">
                <Text className="text-foreground font-medium mb-1.5">Birth Year</Text>
                <TextInput
                  value={formData.birthYear}
                  onChangeText={(val) => handleChange("birthYear", val)}
                  placeholder="1950"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  keyboardType="numeric"
                  className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Password</Text>
              <TextInput
                value={formData.password}
                onChangeText={(val) => handleChange("password", val)}
                placeholder="••••••••"
                placeholderTextColor="hsl(var(--muted-foreground))"
                secureTextEntry
                className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
              />
            </View>

            {!isLogin && (
              <View className="mb-4">
                <Text className="text-foreground font-medium mb-1.5">Confirm Password</Text>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(val) => handleChange("confirmPassword", val)}
                  placeholder="••••••••"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  secureTextEntry
                  className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                />
              </View>
            )}

            {isLogin && (
              <View className="flex-row items-center justify-end mb-4">
                <TouchableOpacity>
                  <Text className="text-accent font-medium">Forgot password?</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              className="w-full bg-accent py-4 rounded-lg flex-row justify-center items-center gap-2 mb-6"
            >
              {isLogin ? (
                <LogIn size={20} color="#fff" />
              ) : (
                <UserPlus size={20} color="#fff" />
              )}
              <Text className="text-white font-bold text-lg">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-muted-foreground text-center text-base">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text className="text-accent font-bold text-base">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-center text-muted-foreground text-sm px-4">
            By {isLogin ? 'signing in' : 'registering'}, you agree to our Terms of Service and Privacy Policy
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
