import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { typography } from '../../theme';

interface ChatInputBarProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

/** Message composer — text input + send button. */
export function ChatInputBar({
  value,
  onChange,
  onSend,
  placeholder = '',
  disabled,
}: ChatInputBarProps) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        multiline
        maxLength={2000}
        editable={!disabled}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={20} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.bubble,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    borderWidth: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.bubble,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
