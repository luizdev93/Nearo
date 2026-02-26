import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getCurrentLocation } from '../../utils/location';

const DEFAULT_REGION = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, locationName?: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

export function LocationPickerModal({
  visible,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}: LocationPickerModalProps) {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && initialLat != null && initialLng != null) {
      setMarker({ lat: initialLat, lng: initialLng });
      setRegion({
        latitude: initialLat,
        longitude: initialLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (visible && !marker) {
      setMarker(null);
    }
  }, [visible, initialLat, initialLng]);

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    const coords = await getCurrentLocation();
    setLoading(false);
    if (coords) {
      const lat = coords.latitude;
      const lng = coords.longitude;
      setMarker({ lat, lng });
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  };

  const handleConfirm = () => {
    if (marker) {
      const name = `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`;
      onSelect(marker.lat, marker.lng, name);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select location</Text>
          <TouchableOpacity onPress={handleConfirm} disabled={!marker}>
            <Text style={[styles.confirmText, !marker && styles.confirmDisabled]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {marker && (
            <Marker
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              title="Listing location"
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarker({ lat: latitude, lng: longitude });
              }}
            />
          )}
        </MapView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.currentLocationBtn}
            onPress={handleUseCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="locate" size={22} color={colors.primary} />
            )}
            <Text style={styles.currentLocationText}>Use current location</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Or tap on the map to place a marker</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confirmText: {
    ...typography.label,
    color: colors.primary,
  },
  confirmDisabled: {
    color: colors.textTertiary,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentLocationText: {
    ...typography.label,
    color: colors.primary,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
