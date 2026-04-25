import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Bell, Settings, Lock, Globe, ArrowLeft, Plus } from 'lucide-react-native';
import { Post } from '../../components/Post';
import { api } from '../../utils/api';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const commRes = await api.get(`/communities/${id}`);
      setCommunity(commRes.data);
      
      const postsRes = await api.get(`/communities/${id}/posts`);
      setPosts(postsRes.data);
    } catch (err) {
      console.error("Topluluk verileri alınamadı:", err);
      Alert.alert("Hata", "Topluluk bilgileri yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [id]);

  const handleJoin = async () => {
    try {
      await api.post(`/communities/${id}/requests`);
      Alert.alert("Başarılı", community.type === "PRIVATE" ? "Katılma isteği gönderildi." : "Topluluğa katıldınız.");
      fetchCommunityData();
    } catch (err: any) {
      Alert.alert("Hata", err.response?.data?.message || "İşlem başarısız.");
    }
  };

  if (isLoading && !community) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="hsl(var(--accent))" />
      </View>
    );
  }

  if (!community) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Topluluk bulunamadı.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <ArrowLeft size={24} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">c/{community.name}</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* Header Hero */}
        <View className="bg-card border border-border rounded-lg p-5 mb-6">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-12 h-12 bg-accent/20 rounded-full items-center justify-center">
                  {community.type === "PRIVATE" ? (
                    <Lock size={20} color="hsl(var(--secondary))" />
                  ) : (
                    <Globe size={20} color="hsl(var(--accent))" />
                  )}
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">c/{community.name}</Text>
                  <Text className="text-accent text-xs">
                    {community.type === "PRIVATE" ? "Gizli Topluluk" : "Açık Topluluk"}
                  </Text>
                </View>
              </View>
              <Text className="text-foreground/80 mt-2 leading-5">{community.description}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {community.isUserMember ? (
              <>
                <View className="flex-1 py-2 bg-secondary/10 border border-secondary/20 rounded-lg flex-row items-center justify-center gap-2">
                  <Users size={18} color="hsl(var(--secondary))" />
                  <Text className="text-secondary font-medium">Üyesiniz</Text>
                </View>
                {community.isUserModerator && (
                  <TouchableOpacity
                    onPress={() => router.push(`/community/dashboard/${id}`)}
                    className="p-2 bg-muted border border-border rounded-lg justify-center"
                  >
                    <Settings size={20} color="hsl(var(--muted-foreground))" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity onPress={handleJoin} className="flex-1 py-3 bg-accent rounded-lg items-center">
                <Text className="text-white font-bold text-base">
                  {community.type === "PRIVATE" ? "Katılma İsteği Gönder" : "Topluluğa Katıl"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center gap-6 pt-3 border-t border-border/50">
            <View className="flex-row items-center gap-1.5">
              <Users size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground font-medium">{community.memberCount} üye</Text>
            </View>
          </View>
        </View>

        {/* Post Composition Trigger */}
        {community.isUserMember && (
          <TouchableOpacity 
             onPress={() => router.push({ pathname: '/', params: { openCreate: 'true', communityId: id } })}
             className="w-full bg-accent py-3 rounded-lg flex-row items-center justify-center mb-6 shadow-sm"
          >
            <Plus size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">c/{community.name} içinde paylaş</Text>
          </TouchableOpacity>
        )}

        <Text className="text-lg font-bold text-foreground mb-4 ml-1">Son Gönderiler</Text>
        
        {/* Posts */}
        <View className="pb-8">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <Post 
                key={post.id} 
                id={post.id}
                author={post.authorName}
                authorRole={post.isOfficialAuthor ? "official" : "standard"}
                community={community.name}
                communityId={Number(id)}
                title={post.title}
                content={post.content}
                image={post.pictureUrl}
                upvotes={post.score}
                downvotes={0}
                commentCount={post.commentCount}
                timestamp={new Date(post.createdAt).toLocaleDateString('tr-TR')}
              />
            ))
          ) : (
             <Text className="text-center text-muted-foreground py-10">Henüz gönderi yok.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
