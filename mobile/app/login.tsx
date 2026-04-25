import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogIn, UserPlus, Building2, User } from 'lucide-react-native';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

type AccountType = 'user' | 'official';
type ORG_TYPE = 'BELEDIYE' | 'VAKIF' | 'DERNEK' | 'DIGER';

const ORG_TYPES: { value: ORG_TYPE; label: string }[] = [
  { value: 'BELEDIYE', label: 'Belediye' },
  { value: 'VAKIF', label: 'Vakıf' },
  { value: 'DERNEK', label: 'Dernek' },
  { value: 'DIGER', label: 'Diğer' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('user');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationType: 'BELEDIYE' as ORG_TYPE,
    organizationDescription: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!formData.username || !formData.password) {
      setErrorMsg('Kullanıcı adı ve şifre zorunludur.');
      return;
    }

    if (!isLogin) {
      if (!formData.name || !formData.surname) {
        setErrorMsg('Ad ve soyad zorunludur.');
        return;
      }
      if (!formData.email) {
        setErrorMsg('E-posta adresi zorunludur.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Şifreler uyuşmuyor!');
        return;
      }
      if (accountType === 'official' && !formData.organizationName.trim()) {
        setErrorMsg('Kurum adı zorunludur.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/auth/login', {
          username: formData.username.trim(),
          password: formData.password,
        });
        const data = response.data;
        if (data.token) {
          await login(data.token, data.refreshToken);
        }
      } else {
        const payload: any = {
          username: formData.username.trim(),
          name: formData.name.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          password: formData.password,
          accountType,
        };

        if (accountType === 'official') {
          payload.organizationName = formData.organizationName.trim();
          payload.organizationType = formData.organizationType;
          payload.organizationDescription = formData.organizationDescription.trim();
        }

        const response = await api.post('/auth/register', payload);
        const data = response.data;

        if (data.status === 'PENDING_APPROVAL') {
          router.replace('/application-pending' as any);
        } else {
          setIsLogin(true);
          setAccountType('user');
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Bağlantı hatası oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setAccountType('user');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 p-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          {/* Header */}
          <View className="mb-8 items-center mt-8">
            <View className="w-16 h-16 bg-primary rounded-xl mb-4 items-center justify-center">
              <Text className="text-white text-3xl font-bold">E</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">
              {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
            </Text>
            <Text className="text-muted-foreground mt-2 text-center text-lg">
              {isLogin ? 'Devam etmek için giriş yapın' : 'Topluluğumuza bugün katılın'}
            </Text>
          </View>

          <View className="bg-card border border-border p-6 rounded-xl shadow-sm mb-6">

            {errorMsg ? (
              <View className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                <Text className="text-red-500 text-sm text-center">{errorMsg}</Text>
              </View>
            ) : null}

            {/* Hesap Tipi Seçimi — sadece register modunda */}
            {!isLogin && (
              <View className="mb-5">
                <Text className="text-foreground font-medium mb-2">Hesap Tipi</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setAccountType('user')}
                    className={`flex-1 p-4 rounded-xl border-2 items-center gap-2 ${accountType === 'user' ? 'border-accent bg-accent/10' : 'border-border'}`}
                  >
                    <User size={24} color={accountType === 'user' ? '#f59e0b' : '#6b7280'} />
                    <Text className={`font-semibold text-sm ${accountType === 'user' ? 'text-accent' : 'text-muted-foreground'}`}>
                      Standart
                    </Text>
                    <Text className="text-xs text-muted-foreground text-center">Bireysel kullanım</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAccountType('official')}
                    className={`flex-1 p-4 rounded-xl border-2 items-center gap-2 ${accountType === 'official' ? 'border-accent bg-accent/10' : 'border-border'}`}
                  >
                    <Building2 size={24} color={accountType === 'official' ? '#f59e0b' : '#6b7280'} />
                    <Text className={`font-semibold text-sm ${accountType === 'official' ? 'text-accent' : 'text-muted-foreground'}`}>
                      Resmi Hesap
                    </Text>
                    <Text className="text-xs text-muted-foreground text-center">Kurum / Kuruluş</Text>
                  </TouchableOpacity>
                </View>
                {accountType === 'official' && (
                  <View className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Text className="text-amber-600 text-xs text-center">
                      Resmi hesaplar admin onayından geçmektedir.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Kullanıcı Adı */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Kullanıcı Adı</Text>
              <TextInput
                value={formData.username}
                onChangeText={(v) => handleChange('username', v)}
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor="hsl(var(--muted-foreground))"
                autoCapitalize="none"
                editable={!isLoading}
                className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
              />
            </View>

            {/* Register alanları */}
            {!isLogin && (
              <>
                <View className="flex-row gap-4 mb-4">
                  <View className="flex-1">
                    <Text className="text-foreground font-medium mb-1.5">Ad</Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(v) => handleChange('name', v)}
                      placeholder="Adınız"
                      placeholderTextColor="hsl(var(--muted-foreground))"
                      editable={!isLoading}
                      className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium mb-1.5">Soyad</Text>
                    <TextInput
                      value={formData.surname}
                      onChangeText={(v) => handleChange('surname', v)}
                      placeholder="Soyadınız"
                      placeholderTextColor="hsl(var(--muted-foreground))"
                      editable={!isLoading}
                      className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-foreground font-medium mb-1.5">Şehir</Text>
                  <TextInput
                    value={formData.city}
                    onChangeText={(v) => handleChange('city', v)}
                    placeholder="Yaşadığınız Şehir"
                    placeholderTextColor="hsl(var(--muted-foreground))"
                    editable={!isLoading}
                    className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-foreground font-medium mb-1.5">E-posta Adresi</Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(v) => handleChange('email', v)}
                    placeholder="ornek@email.com"
                    placeholderTextColor="hsl(var(--muted-foreground))"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                  />
                </View>

                {/* Resmi hesap ek alanları */}
                {accountType === 'official' && (
                  <>
                    <View className="mb-4">
                      <Text className="text-foreground font-medium mb-1.5">Kurum Adı</Text>
                      <TextInput
                        value={formData.organizationName}
                        onChangeText={(v) => handleChange('organizationName', v)}
                        placeholder="Kurumunuzun tam adı"
                        placeholderTextColor="hsl(var(--muted-foreground))"
                        editable={!isLoading}
                        className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-foreground font-medium mb-1.5">Kurum Tipi</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {ORG_TYPES.map((t) => (
                          <TouchableOpacity
                            key={t.value}
                            onPress={() => handleChange('organizationType', t.value)}
                            className={`px-4 py-2 rounded-lg border ${formData.organizationType === t.value ? 'border-accent bg-accent/10' : 'border-border'}`}
                          >
                            <Text className={`font-medium text-sm ${formData.organizationType === t.value ? 'text-accent' : 'text-muted-foreground'}`}>
                              {t.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-foreground font-medium mb-1.5">
                        Kurum Açıklaması <Text className="text-muted-foreground font-normal">(isteğe bağlı)</Text>
                      </Text>
                      <TextInput
                        value={formData.organizationDescription}
                        onChangeText={(v) => handleChange('organizationDescription', v)}
                        placeholder="Kurumunuz hakkında kısa bilgi..."
                        placeholderTextColor="hsl(var(--muted-foreground))"
                        multiline
                        numberOfLines={3}
                        editable={!isLoading}
                        className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                      />
                    </View>
                  </>
                )}
              </>
            )}

            {/* Şifre */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Şifre</Text>
              <TextInput
                value={formData.password}
                onChangeText={(v) => handleChange('password', v)}
                placeholder="••••••••"
                placeholderTextColor="hsl(var(--muted-foreground))"
                secureTextEntry
                editable={!isLoading}
                className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
              />
            </View>

            {!isLogin && (
              <View className="mb-4">
                <Text className="text-foreground font-medium mb-1.5">Şifre Tekrar</Text>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(v) => handleChange('confirmPassword', v)}
                  placeholder="••••••••"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  secureTextEntry
                  editable={!isLoading}
                  className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                />
              </View>
            )}

            {isLogin && (
              <View className="flex-row items-center justify-end mb-4">
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-accent font-medium">Şifremi unuttum?</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg flex-row justify-center items-center gap-2 mb-6 ${isLoading ? 'bg-accent/50' : 'bg-accent'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : isLogin ? (
                <LogIn size={20} color="#fff" />
              ) : (
                <UserPlus size={20} color="#fff" />
              )}
              <Text className="text-white font-bold text-lg">
                {isLoading
                  ? (isLogin ? 'Giriş Yapılıyor...' : 'Kaydediliyor...')
                  : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-muted-foreground text-center text-base">
                {isLogin ? 'Hesabınız yok mu?' : 'Zaten bir hesabınız var mı?'}
              </Text>
              <TouchableOpacity onPress={switchMode} disabled={isLoading}>
                <Text className="text-accent font-bold text-base">
                  {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>

          <Text className="text-center text-muted-foreground text-sm px-4">
            {isLogin ? 'Giriş yaparak' : 'Kayıt olarak'}, Kullanım Şartları ve Gizlilik Politikamızı kabul etmiş olursunuz.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
