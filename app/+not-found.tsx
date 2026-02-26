import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../src/components/layout/ScreenContainer';
import { EmptyState } from '../src/components/common/EmptyState';
import { GradientButton } from '../src/components/ui/GradientButton';
import { colors, spacing } from '../src/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <ScreenContainer>
        <View style={styles.container}>
          <EmptyState
            icon="alert-circle-outline"
            title="Page not found"
            subtitle="The page you're looking for doesn't exist."
          />
          <GradientButton
            label="Go Home"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
          />
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
});
