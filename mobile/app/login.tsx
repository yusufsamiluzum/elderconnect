import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';
import { api } from '../utils/api';
import { saveTokens } from '../utils/auth';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!formData.username || !formData.password) {
      setErrorMsg("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    if (!isLogin) {
      if (!formData.email) {
        setErrorMsg("E-posta adresi zorunludur.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Şifreler uyuşmuyor!");
        return;
      }
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN REQUEST
        const response = await api.post('/auth/login', {
          username: formData.username.trim(),
          password: formData.password
        });
        
        const data = response.data;
        if (data.token) {
          // Save JWT tokens
          await saveTokens(data.token, data.refreshToken);
          console.log("Logged in successfully!", data);
          // Navigate to home feed
          router.replace('/');
        }
      } else {
        // REGISTER REQUEST
        const response = await api.post('/auth/register', {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
        
        console.log("Registered successfully:", response.data);
        Alert.alert("Başarılı", "Hesabınız oluşturuldu. Lütfen giriş yapın.");
        setIsLogin(true); // Switch to login screen natively
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Bağlantı hatası oluştu. Lütfen sunucu ayarlarınızı kontrol edin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          {/* Header */}
          <View className="mb-8 items-center mt-8">
            <View className="w-16 h-16 bg-primary rounded-xl mb-4 items-center justify-center">
              <Text className="text-white text-3xl font-bold">E</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">
              {isLogin ? "Tekrar Hoş Geldiniz" : "Hesap Oluşturun"}
            </Text>
            <Text className="text-muted-foreground mt-2 text-center text-lg">
              {isLogin ? "Devam etmek için giriş yapın" : "Topluluğumuza bugün katılın"}
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card border border-border p-6 rounded-xl shadow-sm mb-6">
            
            {errorMsg ? (
              <View className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                <Text className="text-red-500 text-sm text-center">{errorMsg}</Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Kullanıcı Adı</Text>
              <TextInput
                value={formData.username}
                onChangeText={(val) => handleChange("username", val)}
                placeholder="Kullanıcı adınızı girin (örn. ahmet_amca)"
                placeholderTextColor="hsl(var(--muted-foreground))"
                autoCapitalize="none"
                editable={!isLoading}
                className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
              />
            </View>

            {!isLogin && (
              <View className="mb-4">
                <Text className="text-foreground font-medium mb-1.5">E-posta Adresi</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(val) => handleChange("email", val)}
                  placeholder="ornek@email.com"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  className="w-full p-4 bg-input/50 border border-border rounded-lg text-foreground"
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-1.5">Şifre</Text>
              <TextInput
                value={formData.password}
                onChangeText={(val) => handleChange("password", val)}
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
                  onChangeText={(val) => handleChange("confirmPassword", val)}
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
                {isLoading ? (isLogin ? 'Giriş Yapılıyor...' : 'Kaydediliyor...') : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-muted-foreground text-center text-base">
                {isLogin ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}
              </Text>
              <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrorMsg(""); }} disabled={isLoading}>
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
