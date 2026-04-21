import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Clock, Award, Users, Camera, X } from 'lucide-react-native';
import { Post } from '../../components/Post';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("new");
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/posts', {
        params: { sort: sortBy, page: 0, size: 20 }
      });
      setPosts(response.data);
    } catch (err) {
      console.error("Gönderiler yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    try {
      const response = await api.get('/communities');
      setCommunities(response.data);
    } catch (err) {
      console.error("Topluluklar yüklenemedi:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    if (showCreatePost) {
      fetchMyCommunities();
    }
  }, [showCreatePost]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      Alert.alert("Uyarı", "Başlık ve içerik gereklidir.");
      return;
    }

    setIsUploading(true);
    try {
      let pictureUrl = "";

      // Upload image first if selected
      if (selectedImage) {
        const formData = new FormData();
        const uriParts = selectedImage.split('.');
        const fileType = uriParts[uriParts.length - 1];

        // @ts-ignore
        formData.append('file', {
          uri: selectedImage,
          name: `upload.${fileType}`,
          type: `image/${fileType}`,
        });

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        pictureUrl = uploadRes.data.url;
      }

      await api.post('/posts', {
        title: newPostTitle,
        content: newPostContent,
        communityId: selectedCommunityId,
        pictureUrl: pictureUrl
      });
      
      setShowCreatePost(false);
      setNewPostTitle("");
      setNewPostContent("");
      setSelectedCommunityId(null);
      setSelectedImage(null);
      fetchPosts();
      Alert.alert("Başarılı", "Gönderiniz paylaşıldı!");
    } catch (err) {
      console.error("Gönderi paylaşılamadı:", err);
      Alert.alert("Hata", "Gönderi paylaşılırken bir sorun oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="mb-4 mt-2">
          <Text className="text-2xl font-bold text-foreground">ElderConnect</Text>
          <Text className="text-muted-foreground text-sm">
            {user?.city ? `${user.city} topluluğunda neler oluyor?` : "Topluluğunuzda neler oluyor?"}
          </Text>
        </View>

        <View className="bg-card border border-border rounded-lg p-4 mb-4">
          <TouchableOpacity
            onPress={() => setShowCreatePost(!showCreatePost)}
            className="w-full flex-row items-center gap-2 px-4 py-3 bg-input/50 border border-border rounded-lg"
          >
            <Plus size={20} color="hsl(var(--muted-foreground))" />
            <Text className="text-muted-foreground">Yeni bir gönderi paylaş...</Text>
          </TouchableOpacity>

          {showCreatePost && (
            <View className="mt-4">
              <Text className="text-foreground font-medium mb-2 text-sm">Topluluk Seç (Opsiyonel)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
                <TouchableOpacity 
                   onPress={() => setSelectedCommunityId(null)}
                   className={`px-4 py-2 rounded-full border ${selectedCommunityId === null ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                >
                  <Text className={selectedCommunityId === null ? 'text-white' : 'text-foreground'}>Genel</Text>
                </TouchableOpacity>
                {communities.map((c: any) => (
                  <TouchableOpacity 
                    key={c.id}
                    onPress={() => setSelectedCommunityId(c.id)}
                    className={`px-4 py-2 rounded-full border ${selectedCommunityId === c.id ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                  >
                    <Text className={selectedCommunityId === c.id ? 'text-white' : 'text-foreground'}>c/{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                placeholder="Başlık"
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-3"
              />
              <TextInput
                placeholder="Neler düşünüyorsunuz?"
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={newPostContent}
                onChangeText={setNewPostContent}
                className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-3"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Image Selection */}
              <View className="mb-4">
                {selectedImage ? (
                  <View className="relative">
                    <Image source={{ uri: selectedImage }} className="w-full h-48 rounded-lg" />
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/60 p-1 rounded-full"
                    >
                      <X size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={pickImage}
                    className="w-full h-20 border-2 border-dashed border-border rounded-lg items-center justify-center flex-row gap-2"
                  >
                    <Camera size={24} color="hsl(var(--muted-foreground))" />
                    <Text className="text-muted-foreground font-medium">Fotoğraf Ekle</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCreatePost}
                  disabled={isUploading}
                  className={`px-6 py-2.5 bg-accent rounded-lg flex-1 items-center ${isUploading ? 'opacity-70' : ''}`}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-medium">Paylaş</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowCreatePost(false)}
                  className="px-6 py-2.5 bg-secondary rounded-lg flex-1 items-center"
                >
                  <Text className="text-white font-medium">İptal</Text>
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
            <Text className={`font-medium ${sortBy === "hot" ? "text-white" : "text-foreground"}`}>Popüler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy("new")}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
              sortBy === "new" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Clock size={20} color={sortBy === "new" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`font-medium ${sortBy === "new" ? "text-white" : "text-foreground"}`}>En Yeni</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy("top")}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
              sortBy === "top" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Award size={20} color={sortBy === "top" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`font-medium ${sortBy === "top" ? "text-white" : "text-foreground"}`}>En İyi</Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8">
          {isLoading ? (
            <ActivityIndicator size="large" color="hsl(var(--accent))" />
          ) : posts.length > 0 ? (
            posts.map((post: any) => (
              <Post 
                key={post.id} 
                id={post.id}
                author={post.authorName}
                authorRole={post.isOfficialAuthor ? "official" : "standard"}
                community={post.communityName}
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
            <Text className="text-center text-muted-foreground mt-4">Henüz gönderi yok.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
