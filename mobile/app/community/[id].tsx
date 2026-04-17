import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Bell, Settings, Lock, Globe, ArrowLeft } from 'lucide-react-native';
import { Post } from '../../components/Post';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams();

  const community = {
    id: id || "1",
    name: "satranc-meraklilar",
    description: "Satranç oyununu sevenler için. Stratejiler, bulmacalar ve oyun tartışmaları paylaşın",
    members: 1823,
    posts: 567,
    type: "public" as const,
    isOfficial: false,
    isMember: true,
    rules: [
      "Tüm üyelere saygılı olun",
      "Spam veya kendi reklamını yapmak yasaktır",
      "Gönderileri satranç ile ilgili tutun",
      "Yeni başlayanlara oyunu öğrenmelerinde yardımcı olun",
    ],
    moderators: ["satranc_ustasi", "strateji_uzmani"],
  };

  const communityPosts = [
    {
      id: "1",
      author: "satranc_ustasi",
      authorRole: "standard" as const,
      community: community.name,
      title: "Günlük Satranç Bulmacası - 3 Hamlede Şah Mat",
      content: "İşte bugünün bulmacası! Hamle sırası beyazda ve 3 hamlede şah mat. Çözümü bulabiliyor musunuz? Cevabı yarın yorumlarda paylaşacağım.",
      upvotes: 34,
      downvotes: 1,
      commentCount: 12,
      timestamp: "4 saat önce",
    },
    {
      id: "2",
      author: "piyon_oyuncusu",
      authorRole: "standard" as const,
      community: community.name,
      title: "İlk turnuva maçımı kazandım!",
      content: "Aylarca süren pratik ve açılış çalışmalarından sonra bugün nihayet ilk turnuva maçımı kazandım. Sicilya Savunması gerçekten işe yaradı! Tavsiye ve desteğiniz için hepinize teşekkür ederim.",
      upvotes: 89,
      downvotes: 0,
      commentCount: 24,
      timestamp: "8 saat önce",
    },
  ];

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
                  {community.type === "private" ? (
                    <Lock size={20} color="hsl(var(--secondary))" />
                  ) : (
                    <Globe size={20} color="hsl(var(--accent))" />
                  )}
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">c/{community.name}</Text>
                  <Text className="text-accent text-xs capitalize">{community.type} Community</Text>
                </View>
              </View>
              <Text className="text-foreground/80 mt-2 leading-5">{community.description}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {community.isMember ? (
              <>
                <TouchableOpacity className="flex-1 py-2 bg-accent/10 border border-accent/20 rounded-lg flex-row items-center justify-center gap-2">
                  <Bell size={18} color="hsl(var(--accent))" />
                  <Text className="text-accent font-medium">Subscribed</Text>
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-secondary/10 border border-secondary/20 rounded-lg justify-center">
                  <Settings size={20} color="hsl(var(--secondary))" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity className="flex-1 py-2 bg-accent rounded-lg items-center">
                <Text className="text-white font-medium">Join Community</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center gap-6 pt-3 border-t border-border/50">
            <View className="flex-row items-center gap-1.5">
              <Users size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground font-medium">{community.members.toLocaleString()} members</Text>
            </View>
            <Text className="text-muted-foreground font-medium">{community.posts} posts</Text>
          </View>
        </View>

        {/* Post Composition Trigger */}
        {community.isMember && (
          <TouchableOpacity className="w-full bg-accent py-3 rounded-lg flex-row items-center justify-center mb-6 shadow-sm">
            <Text className="text-white font-bold text-base">Create Post in c/{community.name}</Text>
          </TouchableOpacity>
        )}

        {/* Rules & Info block */}
        <View className="bg-card border border-border rounded-lg p-5 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Community Rules</Text>
          <View className="space-y-3">
            {community.rules.map((rule, index) => (
              <View key={index} className="flex-row gap-3">
                <Text className="text-muted-foreground font-bold">{index + 1}.</Text>
                <Text className="text-foreground flex-1 leading-5">{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-card border border-border rounded-lg p-5 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Moderators</Text>
          <View className="space-y-3">
            {community.moderators.map((mod) => (
              <TouchableOpacity key={mod} className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
                  <Users size={14} color="hsl(var(--accent))" />
                </View>
                <Text className="text-accent font-medium">u/{mod}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="text-lg font-bold text-foreground items-center mb-4 ml-1">Recent Posts</Text>
        
        {/* Posts */}
        <View className="pb-8">
          {communityPosts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
