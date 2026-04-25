import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Clock, CheckCircle } from 'lucide-react-native';

export default function ApplicationPendingScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">

        <View className="w-24 h-24 bg-amber-500/10 rounded-full items-center justify-center mb-6">
          <Clock size={48} color="#f59e0b" />
        </View>

        <Text className="text-3xl font-bold text-foreground text-center mb-3">
          Başvurunuz Alındı
        </Text>

        <Text className="text-muted-foreground text-center text-base leading-6 mb-8">
          Resmi hesap başvurunuz inceleme sürecine alınmıştır. Yönetici onayından sonra
          hesabınıza giriş yapabileceksiniz.
        </Text>

        <View className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
          <View className="flex-row items-center gap-3 mb-2">
            <CheckCircle size={18} color="#f59e0b" />
            <Text className="text-amber-600 font-semibold">Başvuru durumu: Beklemede</Text>
          </View>
          <Text className="text-muted-foreground text-sm">
            Başvurunuz onaylandığında kayıt olurken kullandığınız kullanıcı adı ve
            şifre ile giriş yapabilirsiniz.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/login')}
          className="w-full py-4 bg-accent rounded-xl items-center"
        >
          <Text className="text-white font-bold text-base">Giriş Ekranına Dön</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
