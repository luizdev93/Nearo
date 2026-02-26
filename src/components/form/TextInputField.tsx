import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

const INPUT_HEIGHT = 48;

interface TextInputFieldProps extends Omit<RNTextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
  inputStyle?: RNTextInputProps['style'];
  multiline?: boolean;
  /** 'large' = 52px min height for better tap targets (e.g. search bar) */
  size?: 'default' | 'large';
}

/** Standard input — height 48, radius 12, white background, optional icon and error. */
export function TextInputField({
  value,
  onChangeText,
  placeholder,
  iconLeft,
  secureTextEntry,
  error,
  label,
  inputStyle,
  multiline,
  size = 'default',
  ...rest
}: TextInputFieldProps) {
  const inputWrapStyle = [
    styles.inputWrap,
    size === 'large' && styles.inputWrapLarge,
    multiline && styles.inputWrapMultiline,
    error && styles.inputWrapError,
  ];
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={inputWrapStyle}>
        {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            iconLeft ? styles.inputWithIcon : undefined,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          multiline={multiline}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: INPUT_HEIGHT,
    minHeight: INPUT_HEIGHT,
    borderRadius: borderRadius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  inputWrapLarge: {
    height: 52,
    minHeight: 52,
  },
  inputWrapMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  inputWrapError: {
    borderColor: colors.error,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
