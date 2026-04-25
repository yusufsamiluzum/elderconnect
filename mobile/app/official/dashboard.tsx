import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut, Plus, TrendingUp, MessageSquare, BarChart2,
  Calendar, ChevronUp, ChevronDown, X,
} from 'lucide-react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface OfficialStats {
  totalPosts: number;
  totalInteractions: number;
  averageScorePerPost: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  score: number;
  commentCount: number;
  createdAt: string;
  eventDate?: string;
}

export default function OfficialDashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<OfficialStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    eventDate: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/users/me/official-stats'),
        api.get(`/users/${user?.username}/activity`),
      ]);
      setStats(statsRes.data);
      setPosts(activityRes.data.recentPosts || []);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.username]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert('Uyarı', 'Başlık ve içerik zorunludur.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
      };
      if (newPost.eventDate.trim()) {
        payload.eventDate = new Date(newPost.eventDate.trim()).toISOString();
      }

      await api.post('/posts', payload);
      setCreateModal(false);
      setNewPost({ title: '', content: '', eventDate: '' });
      Alert.alert('Başarılı', 'Etkinlik yayınlandı.');
      fetchData();
    } catch {
      Alert.alert('Hata', 'Etkinlik oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
            {user?.name || user?.username}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <View className="px-2 py-0.5 bg-blue-500/10 rounded-full">
              <Text className="text-blue-500 text-xs font-semibold">Resmi Hesap</Text>
            </View>
            <Text className="text-muted-foreground text-xs">@{user?.username}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} className="p-2 ml-2">
          <LogOut size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* İstatistik Kartları */}
        <View>
          <Text className="text-foreground font-bold text-base mb-3">Genel İstatistikler</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center gap-1">
              <TrendingUp size={22} color="#f59e0b" />
              <Text className="text-2xl font-bold text-foreground">{stats?.totalPosts ?? 0}</Text>
              <Text className="text-muted-foreground text-xs text-center">Toplam Etkinlik</Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center gap-1">
              <MessageSquare size={22} color="#3b82f6" />
              <Text className="text-2xl font-bold text-foreground">{stats?.totalInteractions ?? 0}</Text>
              <Text className="text-muted-foreground text-xs text-center">Toplam Etkileşim</Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center gap-1">
              <BarChart2 size={22} color="#22c55e" />
              <Text className="text-2xl font-bold text-foreground">
                {stats ? stats.averageScorePerPost.toFixed(1) : '0'}
              </Text>
              <Text className="text-muted-foreground text-xs text-center">Ort. Puan</Text>
            </View>
          </View>
        </View>

        {/* Yeni Etkinlik Butonu */}
        <TouchableOpacity
          onPress={() => setCreateModal(true)}
          className="flex-row items-center justify-center gap-2 py-4 bg-accent rounded-xl"
        >
          <Plus size={20} color="#fff" />
          <Text className="text-white font-bold text-base">Yeni Etkinlik Oluştur</Text>
        </TouchableOpacity>

        {/* Geçmiş Etkinlikler */}
        <View>
          <Text className="text-foreground font-bold text-base mb-3">
            Geçmiş Etkinlikler
            {posts.length > 0 && (
              <Text className="text-muted-foreground font-normal text-sm"> ({posts.length})</Text>
            )}
          </Text>

          {posts.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-8 items-center gap-2">
              <TrendingUp size={32} color="#6b7280" />
              <Text className="text-muted-foreground text-center">
                Henüz etkinlik paylaşılmadı.{'\n'}İlk etkinliğinizi oluşturun!
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <Text className="font-bold text-foreground text-base mb-1" numberOfLines={2}>
                  {post.title}
                </Text>
                <Text className="text-muted-foreground text-sm mb-3" numberOfLines={2}>
                  {post.content}
                </Text>

                {post.eventDate && (
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Calendar size={13} color="#f59e0b" />
                    <Text className="text-amber-600 text-xs font-medium">
                      {formatDate(post.eventDate)}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between pt-2 border-t border-border">
                  <Text className="text-muted-foreground text-xs">{formatDate(post.createdAt)}</Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      {post.score >= 0
                        ? <ChevronUp size={14} color="#22c55e" />
                        : <ChevronDown size={14} color="#ef4444" />}
                      <Text className={`text-xs font-semibold ${post.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {post.score}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MessageSquare size={13} color="#6b7280" />
                      <Text className="text-muted-foreground text-xs">{post.commentCount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Yeni Etkinlik Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl p-6">

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-foreground font-bold text-xl">Yeni Etkinlik</Text>
              <TouchableOpacity onPress={() => { setCreateModal(false); setNewPost({ title: '', content: '', eventDate: '' }); }}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-foreground font-medium mb-1.5">Başlık</Text>
            <TextInput
              value={newPost.title}
              onChangeText={(v) => setNewPost((p) => ({ ...p, title: v }))}
              placeholder="Etkinlik başlığı"
              placeholderTextColor="hsl(var(--muted-foreground))"
              editable={!isSubmitting}
              className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground mb-4"
            />

            <Text className="text-foreground font-medium mb-1.5">Açıklama</Text>
            <TextInput
              value={newPost.content}
              onChangeText={(v) => setNewPost((p) => ({ ...p, content: v }))}
              placeholder="Etkinlik detayları..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
              className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground mb-4"
            />

            <Text className="text-foreground font-medium mb-1.5">
              Etkinlik Tarihi <Text className="text-muted-foreground font-normal">(isteğe bağlı)</Text>
            </Text>
            <TextInput
              value={newPost.eventDate}
              onChangeText={(v) => setNewPost((p) => ({ ...p, eventDate: v }))}
              placeholder="YYYY-MM-DD (örn. 2026-05-10)"
              placeholderTextColor="hsl(var(--muted-foreground))"
              editable={!isSubmitting}
              className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground mb-6"
            />

            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl items-center ${isSubmitting ? 'bg-accent/50' : 'bg-accent'}`}
            >
              {isSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-bold text-base">Yayınla</Text>}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
