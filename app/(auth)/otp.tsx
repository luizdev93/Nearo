import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { Button } from '../../src/components/common/Button';
import { TextInput } from '../../src/components/inputs/TextInput';
import { useAuthStore } from '../../src/state/auth_store';
import { isValidOTP } from '../../src/utils/validators';

const RESEND_COOLDOWN = 60;

export default function OTPScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setCodeError('');
    clearError();

    if (!isValidOTP(code)) {
      setCodeError(t('auth.otp.invalid_code'));
      return;
    }

    const success = await verifyOTP(phone!, code);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await sendOTP(phone!);
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.otp.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otp.subtitle', { phone })}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            error={codeError || error || undefined}
            style={styles.otpInput}
          />

          <Button
            title={t('auth.otp.verify')}
            onPress={handleVerify}
            loading={isLoading}
            disabled={code.length < 6}
            size="lg"
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={cooldown > 0}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0
                ? t('auth.otp.resend_in', { seconds: cooldown })
                : t('auth.otp.resend')}
            </Text>
          </TouchableOpacity>
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
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xl,
    alignItems: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  resendButton: {
    padding: spacing.sm,
  },
  resendText: {
    ...typography.label,
    color: colors.primary,
  },
  resendDisabled: {
    color: colors.textTertiary,
  },
});
