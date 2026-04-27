import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, MapPin, Clock, Sparkles } from 'lucide-react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const endpoint = filter === 'recommended' ? '/recommendations/events' : '/events';
      const response = await api.get(endpoint);
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Etkinlikler yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6 mt-2">
          <Text className="text-2xl font-bold text-foreground">Etkinlikler</Text>
          <Text className="text-muted-foreground text-sm">
            Çevrenizdeki resmi kurum etkinlikleri ve duyurular.
          </Text>
        </View>

        {/* Filter Section */}
        <View className="bg-card border border-border rounded-lg p-1.5 mb-6 flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setFilter('all')}
            className={`flex-1 py-2 ${filter === 'all' ? "bg-accent" : "bg-transparent"} rounded-md flex-row justify-center items-center gap-2`}
          >
            <CalendarIcon size={18} color={filter === 'all' ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filter === 'all' ? "text-white" : "text-foreground"} font-medium`}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilter('recommended')}
            className={`flex-1 py-2 ${filter === 'recommended' ? "bg-accent" : "bg-transparent"} rounded-md flex-row justify-center items-center gap-2`}
          >
            <Sparkles size={18} color={filter === 'recommended' ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filter === 'recommended' ? "text-white" : "text-foreground"} font-medium`}>Önerilenler</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="hsl(var(--accent))" className="mt-10" />
        ) : events.length > 0 ? (
          events.map((event: any) => (
            <View key={event.id} className="bg-card border border-border rounded-xl mb-4 overflow-hidden shadow-sm">
              {event.pictureUrl && (
                <Image source={{ uri: event.pictureUrl }} className="w-full h-40" />
              )}
              <View className="p-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <View className="bg-accent/10 px-2 py-0.5 rounded">
                    <Text className="text-accent text-[10px] font-bold uppercase">RESMİ ETKİNLİK</Text>
                  </View>
                  <Text className="text-muted-foreground text-xs">• {event.organizerName || "Belediye"}</Text>
                </View>

                <Text className="text-lg font-bold text-foreground mb-2">{event.title}</Text>
                <Text className="text-muted-foreground text-sm mb-4" numberOfLines={3}>
                  {event.description}
                </Text>

                <View className="space-y-2 border-t border-border/50 pt-4">
                  <View className="flex-row items-center gap-2">
                    <Clock size={16} color="hsl(var(--muted-foreground))" />
                    <Text className="text-foreground text-sm">
                      {new Date(event.eventDate).toLocaleDateString('tr-TR', { 
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MapPin size={16} color="hsl(var(--muted-foreground))" />
                    <Text className="text-foreground text-sm" numberOfLines={1}>
                      {event.locationName}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => Alert.alert("Başarılı", "Etkinliğe katılım isteğiniz alındı.")}
                  className="mt-4 bg-accent py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-bold">Katıl</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="mt-10 items-center">
            <Text className="text-muted-foreground text-center">Henüz etkinlik bulunmuyor.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
