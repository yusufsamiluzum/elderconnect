import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Users, Lock, Globe, Plus, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { api } from '../../utils/api';

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");
  const [newCommunityType, setNewCommunityType] = useState("PUBLIC");

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/communities', {
        params: { filter: filter === "popular" ? "popular" : null }
      });
      setCommunities(response.data);
    } catch (err) {
      console.error("Topluluklar yüklenemedi:", err);
      Alert.alert("Hata", "Topluluk listesi alınamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [filter]);

  const handleCreateCommunity = async () => {
    if (!newCommunityName || !newCommunityDesc) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      await api.post('/communities', {
        name: newCommunityName,
        description: newCommunityDesc,
        type: newCommunityType
      });
      setShowCreateModal(false);
      setNewCommunityName("");
      setNewCommunityDesc("");
      fetchCommunities();
      Alert.alert("Başarılı", "Topluluk başarıyla oluşturuldu.");
    } catch (err) {
      console.error("Topluluk oluşturulamadı:", err);
      Alert.alert("Hata", "Topluluk ismi zaten kullanımda olabilir.");
    }
  };

  const handleJoinRequest = async (communityId: number) => {
    try {
      const response = await api.post(`/communities/${communityId}/requests`);
      Alert.alert("Başarılı", response.data.message);
      fetchCommunities();
    } catch (err: any) {
      Alert.alert("Hata", err.response?.data?.message || "İşlem başarısız oldu.");
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center justify-between mb-4 mt-2">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-bold text-foreground mb-1">Topluluklar</Text>
            <Text className="text-muted-foreground text-sm">İlgi alanlarınıza uygun topluluklara katılarak yeni insanlarla tanışın</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="p-3 bg-accent rounded-lg"
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-card border border-border rounded-lg p-2.5 mb-6 flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setFilter("popular")}
            className={`flex-1 py-1.5 ${filter === "popular" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <TrendingUp size={18} color={filter === "popular" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filter === "popular" ? "text-white" : "text-foreground"} font-medium text-sm`}>Popüler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilter("all")}
            className={`flex-1 py-1.5 ${filter === "all" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <Users size={18} color={filter === "all" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filter === "all" ? "text-white" : "text-foreground"} font-medium text-sm`}>Hepsi</Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8 space-y-4">
          {isLoading ? (
            <ActivityIndicator size="large" color="hsl(var(--accent))" />
          ) : communities.length > 0 ? (
            communities.map((community: any) => (
              <TouchableOpacity 
                key={community.id}
                onPress={() => router.push(`/community/${community.id}`)}
                className="bg-card border border-border rounded-lg p-5 mb-4"
              >
                <View className="flex-row items-start justify-between gap-4 mb-3">
                  <View className="flex-1 flex-row items-center gap-2">
                    <Text className="text-foreground font-bold text-lg">c/{community.name}</Text>
                    {community.type === "PRIVATE" && <Lock size={16} color="hsl(var(--secondary))" />}
                    {community.isOfficial && (
                      <View className="px-1.5 py-0.5 bg-accent rounded">
                        <Text className="text-[10px] text-white">Resmi</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text className="text-foreground/80 mb-4">{community.description}</Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <Users size={14} color="hsl(var(--muted-foreground))" />
                      <Text className="text-muted-foreground text-xs">{community.memberCount} üye</Text>
                    </View>
                  </View>
                  
                  {community.isUserMember ? (
                    <View className="bg-secondary/20 px-4 py-1.5 rounded-md border border-secondary/30">
                       <Text className="text-secondary font-medium text-sm">Üyesiniz</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => handleJoinRequest(community.id, community.type)}
                      className="bg-accent px-4 py-1.5 rounded-md"
                    >
                      <Text className="text-white font-medium text-sm">
                        {community.type === "PRIVATE" ? "İstek Gönder" : "Katıl"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-muted-foreground">Henüz topluluk bulunamadı.</Text>
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-card w-full rounded-xl p-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Yeni Topluluk Oluştur</Text>
            
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">Topluluk Adı</Text>
              <View className="flex-row items-center bg-input/50 border border-border rounded-lg px-3">
                <Text className="text-muted-foreground">c/</Text>
                <TextInput 
                  value={newCommunityName}
                  onChangeText={setNewCommunityName}
                  placeholder="topluluk-adi"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="flex-1 py-3 px-2 text-foreground"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">Açıklama</Text>
              <TextInput 
                value={newCommunityDesc}
                onChangeText={setNewCommunityDesc}
                placeholder="Bu topluluk ne hakkında?"
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">Tür</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => setNewCommunityType("PUBLIC")}
                  className={`flex-1 py-2 rounded border ${newCommunityType === "PUBLIC" ? "bg-accent border-accent" : "border-border"}`}
                >
                  <Text className={`text-center ${newCommunityType === "PUBLIC" ? "text-white" : "text-foreground"}`}>Açık</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setNewCommunityType("PRIVATE")}
                  className={`flex-1 py-2 rounded border ${newCommunityType === "PRIVATE" ? "bg-accent border-accent" : "border-border"}`}
                >
                  <Text className={`text-center ${newCommunityType === "PRIVATE" ? "text-white" : "text-foreground"}`}>Gizli</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCreateCommunity}
                className="flex-1 py-3 bg-accent rounded-lg items-center"
              >
                <Text className="text-white font-medium">Oluştur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-secondary rounded-lg items-center"
              >
                <Text className="text-white font-medium">İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
