import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Bell, ShieldCheck, ShieldOff, Check, X } from 'lucide-react-native';
import { api } from '../../../utils/api';

type Tab = 'requests' | 'members';

export default function CommunityDashboardScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [community, setCommunity] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [commRes, reqRes, memRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/requests`),
        api.get(`/communities/${id}/members`),
      ]);
      setCommunity(commRes.data);
      setRequests(reqRes.data);
      setMembers(memRes.data);
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
  };

  const handleRequest = async (requestId: number, approved: boolean) => {
    try {
      await api.put(`/communities/${id}/requests/${requestId}`, null, {
        params: { approved },
      });
      setRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (approved) {
        const approved_user = requests.find(r => r.requestId === requestId);
        if (approved_user) setMembers(prev => [...prev, approved_user]);
      }
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const handleToggleModerator = async (userId: number, isModerator: boolean) => {
    try {
      if (isModerator) {
        await api.delete(`/communities/${id}/moderators`, { data: { userId } });
        Alert.alert('Başarılı', 'Moderatör yetkisi kaldırıldı.');
      } else {
        await api.post(`/communities/${id}/moderators`, { userId });
        Alert.alert('Başarılı', 'Moderatör yetkisi verildi.');
      }
      fetchData(true);
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="hsl(var(--accent))" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <ArrowLeft size={24} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Topluluk Paneli</Text>
          {community && (
            <Text className="text-xs text-muted-foreground">c/{community.name}</Text>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <View className="flex-row border-b border-border bg-card">
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-3 flex-row items-center justify-center gap-2 border-b-2 ${
            activeTab === 'requests' ? 'border-accent' : 'border-transparent'
          }`}
        >
          <Bell size={16} color={activeTab === 'requests' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'} />
          <Text className={`font-medium text-sm ${activeTab === 'requests' ? 'text-accent' : 'text-muted-foreground'}`}>
            Katılım İstekleri
          </Text>
          {requests.length > 0 && (
            <View className="bg-accent rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('members')}
          className={`flex-1 py-3 flex-row items-center justify-center gap-2 border-b-2 ${
            activeTab === 'members' ? 'border-accent' : 'border-transparent'
          }`}
        >
          <Users size={16} color={activeTab === 'members' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'} />
          <Text className={`font-medium text-sm ${activeTab === 'members' ? 'text-accent' : 'text-muted-foreground'}`}>
            Üyeler ({members.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Katılım İstekleri */}
        {activeTab === 'requests' && (
          <View className="p-4">
            {requests.length === 0 ? (
              <View className="items-center py-16">
                <Bell size={40} color="hsl(var(--muted-foreground))" />
                <Text className="text-muted-foreground mt-3 text-base">Bekleyen katılım isteği yok.</Text>
              </View>
            ) : (
              requests.map((req) => (
                <View
                  key={req.requestId}
                  className="bg-card border border-border rounded-lg p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-foreground font-semibold">
                      {req.name} {req.surname}
                    </Text>
                    <Text className="text-muted-foreground text-sm">@{req.username}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleRequest(req.requestId, true)}
                      className="w-9 h-9 bg-green-500/20 border border-green-500/40 rounded-lg items-center justify-center"
                    >
                      <Check size={18} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRequest(req.requestId, false)}
                      className="w-9 h-9 bg-destructive/10 border border-destructive/30 rounded-lg items-center justify-center"
                    >
                      <X size={18} color="hsl(var(--destructive))" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Üyeler */}
        {activeTab === 'members' && (
          <View className="p-4">
            {members.length === 0 ? (
              <View className="items-center py-16">
                <Users size={40} color="hsl(var(--muted-foreground))" />
                <Text className="text-muted-foreground mt-3 text-base">Henüz üye yok.</Text>
              </View>
            ) : (
              members.map((member: any) => {
                const isMod = community?.moderators
                  ? community.moderators.some((m: any) => m.username === member.username)
                  : false;
                return (
                  <View
                    key={member.username}
                    className="bg-card border border-border rounded-lg p-4 mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-foreground font-semibold">
                          {member.name} {member.surname}
                        </Text>
                        {isMod && (
                          <View className="px-1.5 py-0.5 bg-accent/20 rounded">
                            <Text className="text-accent text-[10px] font-medium">Mod</Text>
                          </View>
                        )}
                        {member.username === community?.ownerName && (
                          <View className="px-1.5 py-0.5 bg-secondary/20 rounded">
                            <Text className="text-secondary text-[10px] font-medium">Kurucu</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-muted-foreground text-sm">@{member.username}</Text>
                    </View>
                    {member.username !== community?.ownerName && (
                      <TouchableOpacity
                        onPress={() => handleToggleModerator(member.id, isMod)}
                        className={`w-9 h-9 rounded-lg items-center justify-center border ${
                          isMod
                            ? 'bg-destructive/10 border-destructive/30'
                            : 'bg-accent/10 border-accent/30'
                        }`}
                      >
                        {isMod
                          ? <ShieldOff size={18} color="hsl(var(--destructive))" />
                          : <ShieldCheck size={18} color="hsl(var(--accent))" />
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
