import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { EmptyState } from '../src/components/common/EmptyState';
import { Button } from '../src/components/common/Button';
import { colors, spacing } from '../src/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Page not found"
          subtitle="The page you're looking for doesn't exist."
        />
        <Button
          title="Go Home"
          onPress={() => router.replace('/(tabs)')}
          style={styles.button}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing['2xl'],
    justifyContent: 'center',
  },
  button: {
    marginTop: spacing.xl,
  },
});
