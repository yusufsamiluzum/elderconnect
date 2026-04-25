import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, ClipboardList, CheckCircle, XCircle, Trash2, Building2, LogOut } from 'lucide-react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

type Tab = 'pending' | 'officials' | 'users';

interface OfficialApplication {
  userId: number;
  profileId: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  organizationName: string;
  organizationType: string;
  organizationDescription: string;
  appliedAt: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  city: string;
  roles: string[];
  isApproved: boolean;
  joinedAt: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<OfficialApplication[]>([]);
  const [officials, setOfficials] = useState<OfficialApplication[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = useCallback(async (tab: Tab) => {
    setIsLoading(true);
    try {
      if (tab === 'pending') {
        const res = await api.get('/admin/officials/pending');
        setPending(res.data);
      } else if (tab === 'officials') {
        const res = await api.get('/admin/officials/approved');
        setOfficials(res.data);
      } else {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      }
    } catch (e) {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(activeTab);
    setRefreshing(false);
  }, [activeTab, fetchData]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleApprove = async (userId: number) => {
    try {
      await api.put(`/admin/officials/${userId}/approve`, { approve: true });
      Alert.alert('Başarılı', 'Hesap onaylandı.');
      fetchData('pending');
    } catch {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    try {
      await api.put(`/admin/officials/${rejectTarget}/approve`, {
        approve: false,
        rejectionReason: rejectReason || 'Belirtilmedi.',
      });
      setRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
      Alert.alert('Bilgi', 'Başvuru reddedildi.');
      fetchData('pending');
    } catch {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleDeleteUser = (userId: number, username: string) => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `"${username}" adlı kullanıcıyı silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${userId}`);
              fetchData(activeTab);
            } catch {
              Alert.alert('Hata', 'Silme işlemi başarısız.');
            }
          },
        },
      ]
    );
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'pending', label: 'Başvurular', icon: ClipboardList },
    { key: 'officials', label: 'Resmi Hesaplar', icon: Building2 },
    { key: 'users', label: 'Tüm Kullanıcılar', icon: Users },
  ];

  const roleLabel = (roles: string[]) => {
    if (roles.includes('ROLE_OFFICIAL')) return 'Resmi';
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    return 'Kullanıcı';
  };

  const roleBadgeColor = (roles: string[]) => {
    if (roles.includes('ROLE_OFFICIAL')) return 'bg-blue-500/10 text-blue-500';
    if (roles.includes('ROLE_ADMIN')) return 'bg-red-500/10 text-red-500';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        <View>
          <Text className="text-xl font-bold text-foreground">Admin Paneli</Text>
          <Text className="text-muted-foreground text-sm">ElderConnect Yönetimi</Text>
        </View>
        <TouchableOpacity onPress={logout} className="p-2">
          <LogOut size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            className={`flex-1 py-3 items-center gap-1 border-b-2 ${activeTab === key ? 'border-accent' : 'border-transparent'}`}
          >
            <Icon size={18} color={activeTab === key ? '#f59e0b' : '#6b7280'} />
            <Text className={`text-xs font-medium ${activeTab === key ? 'text-accent' : 'text-muted-foreground'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* İçerik */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* Başvurular */}
          {activeTab === 'pending' && (
            pending.length === 0
              ? <Text className="text-muted-foreground text-center mt-8">Bekleyen başvuru yok.</Text>
              : pending.map((app) => (
                <View key={app.userId} className="bg-card border border-border rounded-xl p-4">
                  <Text className="font-bold text-foreground text-base">{app.organizationName}</Text>
                  <Text className="text-muted-foreground text-sm mb-1">{app.organizationType}</Text>
                  <Text className="text-muted-foreground text-sm mb-1">@{app.username} · {app.email}</Text>
                  {app.organizationDescription ? (
                    <Text className="text-foreground text-sm mb-3">{app.organizationDescription}</Text>
                  ) : null}
                  <Text className="text-muted-foreground text-xs mb-3">
                    Başvuru: {new Date(app.appliedAt).toLocaleDateString('tr-TR')}
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => handleApprove(app.userId)}
                      className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <CheckCircle size={16} color="#22c55e" />
                      <Text className="text-green-600 font-semibold">Onayla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setRejectTarget(app.userId); setRejectModal(true); }}
                      className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <XCircle size={16} color="#ef4444" />
                      <Text className="text-red-500 font-semibold">Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}

          {/* Onaylı Resmi Hesaplar */}
          {activeTab === 'officials' && (
            officials.length === 0
              ? <Text className="text-muted-foreground text-center mt-8">Onaylı resmi hesap yok.</Text>
              : officials.map((off) => (
                <View key={off.userId} className="bg-card border border-border rounded-xl p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="font-bold text-foreground text-base">{off.organizationName}</Text>
                      <Text className="text-muted-foreground text-sm">{off.organizationType}</Text>
                      <Text className="text-muted-foreground text-sm">@{off.username}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(off.userId, off.username)}
                      className="p-2"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}

          {/* Tüm Kullanıcılar */}
          {activeTab === 'users' && (
            users.length === 0
              ? <Text className="text-muted-foreground text-center mt-8">Kullanıcı bulunamadı.</Text>
              : users.map((u) => (
                <View key={u.id} className="bg-card border border-border rounded-xl p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-bold text-foreground">@{u.username}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${roleBadgeColor(u.roles)}`}>
                          <Text className={`text-xs font-medium ${roleBadgeColor(u.roles)}`}>
                            {roleLabel(u.roles)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-muted-foreground text-sm">{u.name} {u.surname}</Text>
                      <Text className="text-muted-foreground text-sm">{u.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(u.id, u.username)}
                      className="p-2"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}

        </ScrollView>
      )}

      {/* Red Sebebi Modal */}
      <Modal visible={rejectModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full bg-card border border-border rounded-2xl p-6">
            <Text className="text-foreground font-bold text-lg mb-2">Red Sebebi</Text>
            <Text className="text-muted-foreground text-sm mb-4">
              İsteğe bağlı. Boş bırakırsanız "Belirtilmedi" yazılır.
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Red sebebini yazın..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              multiline
              numberOfLines={3}
              className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-4"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setRejectModal(false); setRejectReason(''); setRejectTarget(null); }}
                className="flex-1 py-3 border border-border rounded-lg items-center"
              >
                <Text className="text-foreground font-medium">İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRejectConfirm}
                className="flex-1 py-3 bg-red-500 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Reddet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
