import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../src/theme';
import { EmptyState } from '../src/components/common/EmptyState';
import { LoadingScreen } from '../src/components/common/LoadingScreen';
import { useAuthStore } from '../src/state/auth_store';
import { notificationService } from '../src/services/notification_service';
import { AppNotification, NotificationType } from '../src/models/notification';
import { formatDate } from '../src/utils/formatters';

const NOTIFICATION_ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  new_message: 'chatbubble-outline',
  listing_update: 'pricetag-outline',
  rating_received: 'star-outline',
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await notificationService.getNotifications(user.id);
    if (data) setNotifications(data);
    setIsLoading(false);
  };

  const handlePress = async (notification: AppNotification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }

    if (notification.reference_id) {
      switch (notification.type) {
        case 'new_message':
          router.push(`/chat/${notification.reference_id}`);
          break;
        case 'listing_update':
          router.push(`/listing/${notification.reference_id}`);
          break;
        default:
          break;
      }
    }
  };

  if (isLoading) return <LoadingScreen />;

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={NOTIFICATION_ICONS[item.type]}
          size={22}
          color={item.read ? colors.textTertiary : colors.primary}
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemText, !item.read && styles.itemTextUnread]}>
          {t(`notifications.${item.type}`)}
        </Text>
        <Text style={styles.itemTime}>{formatDate(item.created_at)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('notifications.title') }} />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title={t('notifications.empty')} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  itemUnread: {
    backgroundColor: colors.surfaceSecondary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  itemTextUnread: {
    fontWeight: '600',
  },
  itemTime: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
