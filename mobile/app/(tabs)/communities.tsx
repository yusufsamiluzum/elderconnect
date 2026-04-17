import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Users, Lock, Globe, Plus, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

export default function CommunitiesScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");
  const [newCommunityType, setNewCommunityType] = useState<"public" | "private">("public");

  const communities = [
    {
      id: "1",
      name: "yerel-etkinlikler",
      description: "Belediye ve yerel organizasyonlardan resmi duyurular ve etkinlikler",
      members: 2451,
      posts: 342,
      type: "public" as const,
      isOfficial: true,
    },
    {
      id: "2",
      name: "satranc-meraklilar",
      description: "Satranç oyununu sevenler için. Stratejiler, bulmacalar ve oyun tartışmaları paylaşın",
      members: 1823,
      posts: 567,
      type: "public" as const,
      isOfficial: false,
    },
    {
      id: "3",
      name: "kitap-kulubu",
      description: "Aylık kitap tartışmaları, öneriler ve edebi sohbetler",
      members: 1547,
      posts: 423,
      type: "public" as const,
      isOfficial: false,
    },
    {
      id: "4",
      name: "bahce-ipuclari",
      description: "Bitki yetiştirme bilginizi paylaşın ve diğer bahçıvanlardan öğrenin",
      members: 1234,
      posts: 891,
      type: "public" as const,
      isOfficial: false,
    },
    {
      id: "6",
      name: "gaziler-grubu",
      description: "Gazilerin bağlantı kurması ve deneyimlerini paylaşması için özel bir topluluk",
      members: 456,
      posts: 234,
      type: "private" as const,
      isOfficial: false,
    },
  ];

  const handleCreateCommunity = () => {
    setShowCreateModal(false);
    setNewCommunityName("");
    setNewCommunityDesc("");
    setNewCommunityType("public");
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center justify-between mb-4 mt-2">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-bold text-foreground mb-1">Communities</Text>
            <Text className="text-muted-foreground text-sm">Join communities to connect with people who share your interests</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="p-3 bg-accent rounded-lg"
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-card border border-border rounded-lg p-2.5 mb-6 flex-row gap-2">
          <TouchableOpacity className="flex-1 py-1.5 bg-accent rounded flex-row justify-center items-center gap-2">
            <TrendingUp size={18} color="#fff" />
            <Text className="text-white font-medium text-sm">Popular</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-1.5 bg-transparent rounded flex-row justify-center items-center gap-2">
            <Users size={18} color="hsl(var(--foreground))" />
            <Text className="text-foreground font-medium text-sm">All</Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8 space-y-4">
          {communities.map((community) => (
            <TouchableOpacity 
              key={community.id}
              onPress={() => router.push(`/community/${community.id}`)}
              className="bg-card border border-border rounded-lg p-5 mb-4"
            >
              <View className="flex-row items-start justify-between gap-4 mb-3">
                <View className="flex-1 flex-row items-center gap-2">
                  <Text className="text-foreground font-bold text-lg">c/{community.name}</Text>
                  {community.type === "private" && <Lock size={16} color="hsl(var(--secondary))" />}
                  {community.isOfficial && (
                    <View className="px-1.5 py-0.5 bg-accent rounded">
                      <Text className="text-[10px] text-white">Official</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text className="text-foreground/80 mb-4">{community.description}</Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Users size={14} color="hsl(var(--muted-foreground))" />
                    <Text className="text-muted-foreground text-xs">{community.members.toLocaleString()} members</Text>
                  </View>
                  <Text className="text-muted-foreground text-xs">{community.posts} posts</Text>
                </View>
                
                <TouchableOpacity className="bg-accent px-4 py-1.5 rounded-md">
                  <Text className="text-white font-medium text-sm">
                    {community.type === "private" ? "Request" : "Join"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Model */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-card w-full rounded-xl p-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Create a Community</Text>
            
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">Community Name</Text>
              <View className="flex-row items-center bg-input/50 border border-border rounded-lg px-3">
                <Text className="text-muted-foreground">c/</Text>
                <TextInput 
                  value={newCommunityName}
                  onChangeText={setNewCommunityName}
                  placeholder="community-name"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="flex-1 py-3 px-2 text-foreground"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">Description</Text>
              <TextInput 
                value={newCommunityDesc}
                onChangeText={setNewCommunityDesc}
                placeholder="What is your community about?"
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCreateCommunity}
                className="flex-1 py-3 bg-accent rounded-lg items-center"
              >
                <Text className="text-white font-medium">Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-secondary rounded-lg items-center"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
