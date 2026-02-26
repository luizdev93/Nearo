import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { Button } from '../../src/components/common/Button';
import { TextInput } from '../../src/components/inputs/TextInput';
import { useAuthStore } from '../../src/state/auth_store';
import { isValidPhone } from '../../src/utils/validators';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendOTP, signInWithGoogle, isLoading, error, clearError } =
    useAuthStore();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleContinue = async () => {
    setPhoneError('');
    clearError();

    if (!isValidPhone(phone)) {
      setPhoneError(t('auth.login.invalid_phone'));
      return;
    }

    const success = await sendOTP(phone);
    if (success) {
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    }
  };

  const handleGoogleSignIn = async () => {
    setPhoneError('');
    clearError();
    const success = await signInWithGoogle();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label={t('auth.login.phone_placeholder')}
            placeholder="+1 234 567 8900"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoFocus
            error={phoneError || error || undefined}
          />

          <Button
            title={t('auth.login.continue')}
            onPress={handleContinue}
            loading={isLoading}
            disabled={!phone.trim()}
            size="lg"
          />

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>{t('auth.login.or')}</Text>
            <View style={styles.separatorLine} />
          </View>

          <Button
            title={t('auth.login.sign_in_with_google')}
            onPress={handleGoogleSignIn}
            loading={isLoading}
            variant="outline"
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing['2xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xl,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
