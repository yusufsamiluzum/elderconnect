import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Calendar, MapPin, Award, Edit, LogOut, Users, Lock, Globe, ShieldCheck } from 'lucide-react-native';
import { Post } from '../../components/Post';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, karmaScore: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [adminCommunities, setAdminCommunities] = useState<{id: number; name: string}[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const statsRes = await api.get('/users/me/stats');
        setStats(statsRes.data);

        if (activeTab === 'posts') {
          const activityRes = await api.get(`/users/${user.username}/activity`);
          setUserPosts(activityRes.data.recentPosts || []);
        } else if (activeTab === 'saved') {
          const savedRes = await api.get('/users/me/saved');
          setUserPosts(savedRes.data || []);
        } else if (activeTab === 'communities') {
          const commRes = await api.get('/users/me/communities');
          setMyCommunities(commRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile stats/activity:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [user, activeTab]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="hsl(var(--accent))" />
      </View>
    );
  }

  const joinDateStr = new Date(user.joinedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center justify-between mt-2 mb-2">
          <Text className="text-xl font-bold text-foreground">Profilim</Text>
          <TouchableOpacity onPress={logout} className="p-2 bg-destructive/10 rounded-full flex-row items-center gap-2">
            <LogOut size={18} color="hsl(var(--destructive))" />
            <Text className="text-destructive font-medium text-sm">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="bg-card border border-border rounded-lg p-6 mb-6">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-16 h-16 bg-accent rounded-full items-center justify-center">
              <User size={32} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground mb-1">
                {user.name && user.surname ? `${user.name} ${user.surname}` : `u/${user.username}`}
              </Text>
              <Text className="text-muted-foreground text-sm mb-1">@{user.username}</Text>
              
              {user.isApproved && (
                <View className="px-2 py-1 bg-accent rounded self-start">
                  <Text className="text-white text-xs font-medium">Resmi Hesap</Text>
                </View>
              )}
            </View>
          </View>

          <Text className="text-foreground/80 mb-4 leading-5">
            {user.description || "Henüz bir biyografi eklenmedi. Profilinizi düzenleyerek kendinizden bahsedin!"}
          </Text>

          <View className="space-y-2 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Calendar size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">Katılım: {joinDateStr}</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <MapPin size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">{user.city || "Konum Belirtilmedi"}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Award size={16} color="hsl(var(--muted-foreground))" />
              <Text className="text-muted-foreground text-sm">{stats.karmaScore || user.karmaScore} itibar puanı</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => router.push('/modal')}
            className="w-full py-2.5 bg-accent/10 rounded-lg flex-row items-center justify-center gap-2 border border-accent/20"
          >
            <Edit size={18} color="hsl(var(--accent))" />
            <Text className="text-accent font-medium">Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Block */}
        <View className="bg-card border border-border rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">İstatistikler</Text>
          {isLoading ? (
             <ActivityIndicator size="small" />
          ) : (
            <View className="space-y-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground">Gönderiler</Text>
                <Text className="text-foreground font-medium">{stats.totalPosts}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground">Yorumlar</Text>
                <Text className="text-foreground font-medium">{stats.totalComments}</Text>
              </View>
            </View>
          )}
        </View>

        {/* User Posts area */}
        <View className="bg-card border border-border rounded-lg p-2.5 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              className={`px-4 py-2 ${activeTab === 'posts' ? 'bg-accent' : 'bg-transparent'} rounded-lg`}
            >
              <Text className={`${activeTab === 'posts' ? 'text-white' : 'text-foreground'} font-medium text-sm`}>Gönderilerim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('saved')}
              className={`px-4 py-2 ${activeTab === 'saved' ? 'bg-accent' : 'bg-transparent'} rounded-lg`}
            >
              <Text className={`${activeTab === 'saved' ? 'text-white' : 'text-foreground'} font-medium text-sm`}>Kaydedilenler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('communities')}
              className={`px-4 py-2 ${activeTab === 'communities' ? 'bg-accent' : 'bg-transparent'} rounded-lg`}
            >
              <Text className={`${activeTab === 'communities' ? 'text-white' : 'text-foreground'} font-medium text-sm`}>Topluluklarım</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="pb-8">
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : activeTab === 'communities' ? (
            myCommunities.length > 0 ? (
              myCommunities.map((community: any) => (
                <TouchableOpacity
                  key={community.id}
                  onPress={() => router.push(`/community/${community.id}`)}
                  className="bg-card border border-border rounded-lg p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-3">
                    <View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center">
                      {community.type === 'PRIVATE'
                        ? <Lock size={18} color="hsl(var(--secondary))" />
                        : <Globe size={18} color="hsl(var(--accent))" />
                      }
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className="text-foreground font-semibold">c/{community.name}</Text>
                        {community.isOfficial && (
                          <View className="px-1.5 py-0.5 bg-accent rounded">
                            <Text className="text-[10px] text-white">Resmi</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Users size={12} color="hsl(var(--muted-foreground))" />
                        <Text className="text-muted-foreground text-xs">{community.memberCount} üye</Text>
                      </View>
                    </View>
                  </View>
                  <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    community.isUserModerator
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-secondary/10 border-secondary/20'
                  }`}>
                    {community.isUserModerator && (
                      <ShieldCheck size={12} color="hsl(var(--accent))" />
                    )}
                    <Text className={`text-xs font-medium ${community.isUserModerator ? 'text-accent' : 'text-secondary'}`}>
                      {community.isUserModerator ? 'Yönetici' : 'Katılımcı'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-center text-muted-foreground mt-4">Henüz bir topluluğa katılmadınız.</Text>
            )
          ) : userPosts.length > 0 ? (
            userPosts.map((post: any) => (
              <Post
                key={post.id}
                id={post.id}
                author={post.authorName}
                authorRole={post.isOfficialAuthor ? "official" : "standard"}
                title={post.title}
                content={post.content}
                image={post.pictureUrl}
                upvotes={post.score}
                downvotes={0}
                commentCount={post.commentCount}
                timestamp={new Date(post.createdAt).toLocaleDateString('tr-TR')}
                initialIsSaved={activeTab === 'saved'}
                adminCommunities={adminCommunities}
              />
            ))
          ) : (
            <Text className="text-center text-muted-foreground mt-4">Burada henüz bir şey yok.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
