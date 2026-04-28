import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Clock, Award, Users, Camera, X, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Post } from '../../components/Post';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function FeedScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [adminCommunities, setAdminCommunities] = useState<{id: number; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("new");
  const [filterBy, setFilterBy] = useState<"all" | "following" | "recommended">("all");
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (params.openCreate === 'true') {
      setShowCreatePost(true);
      if (params.communityId) {
        setSelectedCommunityId(Number(params.communityId));
      }
    }
  }, [params.openCreate, params.communityId]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (filterBy === "recommended") {
        response = await api.get('/recommendations/posts');
        setPosts(Array.isArray(response.data) ? response.data : []);
      } else {
        response = await api.get('/posts', {
          params: { sort: sortBy, filter: filterBy, page: 0, size: 20 }
        });
        const data = response.data.content || response.data;
        setPosts(Array.isArray(data) ? data : []);
      }
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
    if (filterBy === "recommended") {
      api.post('/recommendations/update-interests').catch(() => {});
    }
    fetchPosts();
  }, [sortBy, filterBy]);

  useEffect(() => {
    if (showCreatePost) {
      fetchMyCommunities();
    }
  }, [showCreatePost]);

  useEffect(() => {
    const fetchAdminCommunities = async () => {
      try {
        const res = await api.get('/users/me/communities');
        const moderatorCommunities = (res.data || [])
          .filter((c: any) => c.isUserModerator)
          .map((c: any) => ({ id: c.id, name: c.name }));
        setAdminCommunities(moderatorCommunities);
      } catch (err) {
        console.error("Admin topluluklar yüklenemedi:", err);
      }
    };
    fetchAdminCommunities();
  }, []);

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
        
        if (Platform.OS === 'web') {
          // For web, we need to fetch the blob from the URI
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          formData.append('file', blob, 'upload.jpg');
        } else {
          const uriParts = selectedImage.split('.');
          const fileType = uriParts[uriParts.length - 1];
          // @ts-ignore
          formData.append('file', {
            uri: selectedImage,
            name: `upload.${fileType}`,
            type: `image/${fileType}`,
          });
        }

        const uploadRes = await api.post('/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json' 
          }
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
              <Text className="text-foreground font-medium mb-2 text-sm">Nerede paylaşmak istersiniz?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
                <TouchableOpacity 
                   onPress={() => setSelectedCommunityId(null)}
                   className={`px-4 py-2 rounded-full border ${selectedCommunityId === null ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                >
                  <Text className={selectedCommunityId === null ? 'text-white' : 'text-foreground'}>Ana Akış (Genel)</Text>
                </TouchableOpacity>
                {communities.map((c: any) => {
                  const canPost = !c.isOfficial || user?.isApproved; // Simplification: isApproved means official role
                  if (!canPost && !c.isUserMember) return null; // Only show if member or can post
                  
                  return (
                    <TouchableOpacity 
                      key={c.id}
                      onPress={() => setSelectedCommunityId(c.id)}
                      className={`px-4 py-2 rounded-full border ${selectedCommunityId === c.id ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <Text className={selectedCommunityId === c.id ? 'text-white' : 'text-foreground'}>
                          c/{c.name} {c.isOfficial ? '📢' : ''}
                        </Text>
                        {c.isUserMember && (
                          <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
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

        <View className="bg-card border border-border rounded-lg p-2.5 mb-6 flex-row gap-2">
          <TouchableOpacity 
            onPress={() => { setSortBy("hot"); setFilterBy("all"); }}
            className={`flex-1 py-1.5 ${sortBy === "hot" && filterBy === "all" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <TrendingUp size={16} color={sortBy === "hot" && filterBy === "all" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${sortBy === "hot" && filterBy === "all" ? "text-white" : "text-foreground"} font-medium text-xs`}>Popüler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setSortBy("new"); setFilterBy("all"); }}
            className={`flex-1 py-1.5 ${sortBy === "new" && filterBy === "all" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <Clock size={16} color={sortBy === "new" && filterBy === "all" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${sortBy === "new" && filterBy === "all" ? "text-white" : "text-foreground"} font-medium text-xs`}>En Yeni</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setFilterBy("recommended"); }}
            className={`flex-1 py-1.5 ${filterBy === "recommended" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <Sparkles size={16} color={filterBy === "recommended" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filterBy === "recommended" ? "text-white" : "text-foreground"} font-medium text-xs`}>Sizin İçin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setSortBy("new"); setFilterBy("following"); }}
            className={`flex-1 py-1.5 ${filterBy === "following" ? "bg-accent" : "bg-transparent"} rounded flex-row justify-center items-center gap-2`}
          >
            <Award size={16} color={filterBy === "following" ? "#fff" : "hsl(var(--foreground))"} />
            <Text className={`${filterBy === "following" ? "text-white" : "text-foreground"} font-medium text-xs`}>Takip</Text>
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
                communityId={post.communityId}
                title={post.title}
                content={post.content}
                image={post.pictureUrl}
                upvotes={post.score}
                downvotes={0}
                commentCount={post.commentCount}
                timestamp={new Date(post.createdAt).toLocaleDateString('tr-TR')}
                adminCommunities={adminCommunities}
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
