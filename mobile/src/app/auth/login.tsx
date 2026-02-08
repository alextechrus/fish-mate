import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fish, Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useAuthStore } from '@/lib/state/auth-store';
import { cn } from '@/lib/cn';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.replace('/(tabs)/my-tank');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E3A5F'] : ['#0EA5E9', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280 }}
      />

      <SafeAreaView edges={['top']} className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="px-5 pt-2 pb-8">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-6"
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>

              <View className="flex-row items-center mb-4">
                <View className="bg-white/20 rounded-full p-3 mr-3">
                  <Fish size={32} color="white" />
                </View>
                <View>
                  <Text className="text-white text-3xl font-bold">Welcome Back</Text>
                  <Text className="text-white/80 text-base">Sign in to continue</Text>
                </View>
              </View>
            </View>

            {/* Form Card */}
            <View className="flex-1 px-5">
              <View
                className={cn(
                  'rounded-3xl p-6',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                {error ? (
                  <View className="bg-red-500/10 rounded-xl p-4 mb-4">
                    <Text className="text-red-500 text-sm text-center">{error}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View className="mb-4">
                  <Text
                    className={cn(
                      'text-sm font-medium mb-2',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    Email
                  </Text>
                  <View
                    className={cn(
                      'flex-row items-center rounded-xl px-4',
                      isDark ? 'bg-slate-700' : 'bg-slate-100'
                    )}
                  >
                    <Mail size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                      }}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text
                    className={cn(
                      'text-sm font-medium mb-2',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    Password
                  </Text>
                  <View
                    className={cn(
                      'flex-row items-center rounded-xl px-4',
                      isDark ? 'bg-slate-700' : 'bg-slate-100'
                    )}
                  >
                    <Lock size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      secureTextEntry={!showPassword}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                      }}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                      ) : (
                        <Eye size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Login Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="overflow-hidden rounded-xl"
                >
                  <LinearGradient
                    colors={['#0EA5E9', '#0284C7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">Sign In</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Register Link */}
                <View className="flex-row justify-center mt-6">
                  <Text
                    className={cn(
                      'text-sm',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Don't have an account?{' '}
                  </Text>
                  <Pressable onPress={() => router.replace('/auth/register')}>
                    <Text className="text-sky-500 text-sm font-semibold">Sign Up</Text>
                  </Pressable>
                </View>
              </View>

              {/* Skip for now */}
              <Pressable
                onPress={() => router.back()}
                className="py-4 mt-4"
              >
                <Text
                  className={cn(
                    'text-center text-sm',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Continue without account
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
