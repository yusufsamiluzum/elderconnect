import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { X, Save } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function EditProfileModal() {
  const { user, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    city: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        city: user.city || '',
        description: user.description || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/me', formData);
      await checkAuth(); // Refresh the global user state
      router.back();
    } catch (error) {
      console.error("Failed to update profile", error);
      Alert.alert("Hata", "Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background pt-12 px-4">
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between pb-4 border-b border-border mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Profili Düzenle</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isLoading}
          className="p-2 rounded-full flex-row items-center gap-1"
        >
          {isLoading ? <ActivityIndicator size="small" /> : <Save size={20} color="hsl(var(--accent))" />}
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4 mb-4">
        <View className="flex-1">
          <Text className="text-foreground font-medium mb-1.5">Ad</Text>
          <TextInput
            value={formData.name}
            onChangeText={(val) => setFormData({ ...formData, name: val })}
            placeholder="Adınız"
            placeholderTextColor="hsl(var(--muted-foreground))"
            className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
          />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-medium mb-1.5">Soyad</Text>
          <TextInput
            value={formData.surname}
            onChangeText={(val) => setFormData({ ...formData, surname: val })}
            placeholder="Soyadınız"
            placeholderTextColor="hsl(var(--muted-foreground))"
            className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-foreground font-medium mb-1.5">Şehir / Konum</Text>
        <TextInput
          value={formData.city}
          onChangeText={(val) => setFormData({ ...formData, city: val })}
          placeholder="Yaşadığınız Şehir"
          placeholderTextColor="hsl(var(--muted-foreground))"
          className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
        />
        <Text className="text-muted-foreground text-xs mt-1">Gireceğiniz şehre göre özel topluluk önerileri sunacağız.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-foreground font-medium mb-1.5">Biyografi</Text>
        <TextInput
          value={formData.description}
          onChangeText={(val) => setFormData({ ...formData, description: val })}
          placeholder="Kendinizden bahsedin..."
          placeholderTextColor="hsl(var(--muted-foreground))"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground min-h-[100px]"
        />
      </View>
      
      <TouchableOpacity 
        onPress={handleSave} 
        disabled={isLoading}
        className="w-full py-4 mt-6 bg-accent rounded-lg items-center justify-center flex-row gap-2"
      >
        <Text className="text-white font-bold text-lg">Değişiklikleri Kaydet</Text>
      </TouchableOpacity>

    </View>
  );
}
