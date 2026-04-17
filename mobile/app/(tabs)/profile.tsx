import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Calendar, MapPin, Award, Edit } from 'lucide-react-native';
import { Post } from '../../components/Post';

export default function ProfileScreen() {
  const username = "ali_yilmaz"; // Fallback placeholder

  const user = {
    username: username,
    role: "standard",
    joinDate: "January 2024",
    location: "Springfield",
    bio: "Emekli öğretmen, okumayı ve bahçeciliği çok sever. Yeni gelenlere işi öğretmekten her zaman mutluluk duyarım!",
    karma: 1247,
    postsCount: 42,
    commentsCount: 186,
  };

  const userPosts = [
    {
      id: "1",
      author: user.username,
      authorRole: "standard" as const,
      community: "bahce-ipuclari",
      title: "Domateslerim nihayet olgunlaşıyor!",
      content: "Haftalarca süren dikkatli sulama ve budamadan sonra domates bitkilerim güzel kırmızı domatesler veriyor. İlgilenen herkesle ipuçlarını paylaşmaktan mutluluk duyarım!",
      upvotes: 45,
      downvotes: 1,
      commentCount: 8,
      timestamp: "2 gün önce",
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View className="bg-card border border-border rounded-lg p-6 mb-6 mt-4">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-16 h-16 bg-accent rounded-full items-center justify-center">
              <User size={32} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground mb-1">u/{user.username}</Text>
              {user.role === "official" && (
                <View className="px-2 py-1 bg-accent rounded self-start">
                  <Text className="text-white text-xs font-medium">Official</Text>
                </View>
              )}
              {user.role === "super_admin" && (
                <View className="px-2 py-1 bg-destructive rounded self-start">
                  <Text className="text-white text-xs font-medium">Admin</Text>
                </View>
              )}
            </View>
          </View>

          <Text className="text-foreground/80 mb-4 leading-5">{user.bio}</Text>

          <View className="space-y-2 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Calendar size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">Joined {user.joinDate}</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <MapPin size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">{user.location}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Award size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">{user.karma} karma</Text>
            </View>
          </View>

          <TouchableOpacity className="w-full py-2.5 bg-accent/10 rounded-lg flex-row items-center justify-center gap-2 border border-accent/20">
            <Edit size={18} color="hsl(var(--accent))" />
            <Text className="text-accent font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Block */}
        <View className="bg-card border border-border rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Statistics</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground">Posts</Text>
              <Text className="text-foreground font-medium">{user.postsCount}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground">Comments</Text>
              <Text className="text-foreground font-medium">{user.commentsCount}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Karma</Text>
              <Text className="text-foreground font-medium">{user.karma}</Text>
            </View>
          </View>
        </View>

        {/* Active Communities Block */}
        <View className="bg-card border border-border rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Active Communities</Text>
          <View className="space-y-2">
            {["bahce-ipuclari", "kitap-kulubu", "satranc-meraklilar"].map((community) => (
              <TouchableOpacity key={community} className="mb-2">
                <Text className="text-accent font-medium">c/{community}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User Posts area */}
        <View className="bg-card border border-border rounded-lg p-2.5 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <TouchableOpacity className="px-4 py-2 bg-accent rounded-lg">
              <Text className="text-white font-medium text-sm">Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-transparent rounded-lg">
              <Text className="text-foreground font-medium text-sm">Comments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-transparent rounded-lg">
              <Text className="text-foreground font-medium text-sm">Saved</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="pb-8">
          {userPosts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
