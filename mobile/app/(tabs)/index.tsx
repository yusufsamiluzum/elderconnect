import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Clock, Award } from 'lucide-react-native';
import { Post } from '../../components/Post';

export default function FeedScreen() {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCommunity, setNewPostCommunity] = useState("");

  const posts = [
    {
      id: "1",
      author: "city_hall",
      authorRole: "official" as const,
      community: "local-events",
      title: "Topluluk Bahçesi Açılışı Bu Cumartesi!",
      content: "Yeni topluluk bahçemizin büyük açılışı için bu Cumartesi sabah 10'da bize katılın. İkramlar, bahçecilik atölyeleri ve tüm katılımcılar için ücretsiz bitki tohumları olacak. Arkadaşlarınızı ve ailenizi getirin!",
      image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&h=400&fit=crop",
      upvotes: 124,
      downvotes: 3,
      commentCount: 18,
      timestamp: "3 hours ago",
    },
    {
      id: "2",
      author: "margaret_w",
      authorRole: "standard" as const,
      community: "chess-enthusiasts",
      title: "Satranç Kulübü Toplantısı - Yeni Üyelere Kapımız Açık!",
      content: "Satranç kulübümüz her Salı ve Perşembe topluluk merkezinde toplanıyor. Her seviyeden oyuncu katılabilir! Yeni başlayanlara öğretmekten mutluluk duyacak deneyimli oyuncularımız var. Kahve ve atıştırmalıklar bizden.",
      upvotes: 89,
      downvotes: 2,
      commentCount: 12,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      author: "health_dept",
      authorRole: "official" as const,
      title: "Gelecek Hafta Ücretsiz Sağlık Taraması Etkinliği",
      content: "Sağlık Bakanlığı önümüzdeki Çarşamba sabah 9 ile akşam 4 arasında halk merkezinde ücretsiz sağlık taramaları sunacak. Hizmetler arasında tansiyon ölçümü, kolesterol taraması ve diyabet testi yer alıyor. Randevu gerekmiyor.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
      upvotes: 245,
      downvotes: 1,
      commentCount: 34,
      timestamp: "6 hours ago",
    },
  ];

  const handleCreatePost = () => {
    console.log("Creating post:", { title: newPostTitle, content: newPostContent, community: newPostCommunity });
    setShowCreatePost(false);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCommunity("");
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="bg-card border border-border rounded-lg p-4 mb-4">
          <TouchableOpacity
            onPress={() => setShowCreatePost(!showCreatePost)}
            className="w-full flex-row items-center gap-2 px-4 py-3 bg-input/50 border border-border rounded-lg"
          >
            <Plus size={20} color="hsl(var(--muted-foreground))" />
            <Text className="text-muted-foreground">Create a post</Text>
          </TouchableOpacity>

          {showCreatePost && (
            <View className="mt-4">
              <TextInput
                placeholder="Community (optional)"
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={newPostCommunity}
                onChangeText={setNewPostCommunity}
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-3"
              />
              <TextInput
                placeholder="Title"
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-3"
              />
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={newPostContent}
                onChangeText={setNewPostContent}
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-3"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCreatePost}
                  className="px-6 py-2.5 bg-accent rounded-lg flex-1 items-center"
                >
                  <Text className="text-white font-medium">Post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowCreatePost(false)}
                  className="px-6 py-2.5 bg-secondary rounded-lg flex-1 items-center"
                >
                  <Text className="text-white font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="bg-card border border-border rounded-lg p-2 mb-4 flex-row gap-2">
          <TouchableOpacity
            onPress={() => setSortBy("hot")}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
              sortBy === "hot" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <TrendingUp size={20} color={sortBy === "hot" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`font-medium ${sortBy === "hot" ? "text-white" : "text-foreground"}`}>Hot</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy("new")}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
              sortBy === "new" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Clock size={20} color={sortBy === "new" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`font-medium ${sortBy === "new" ? "text-white" : "text-foreground"}`}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy("top")}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
              sortBy === "top" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Award size={20} color={sortBy === "top" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`font-medium ${sortBy === "top" ? "text-white" : "text-foreground"}`}>Top</Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8">
          {posts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
