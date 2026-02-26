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
  ...rest
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          style={[styles.input, iconLeft ? styles.inputWithIcon : undefined, inputStyle]}
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
    borderRadius: borderRadius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
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
  inputWithIcon: {
    paddingLeft: 0,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
