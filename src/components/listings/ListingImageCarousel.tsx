import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ListingImageCarouselProps {
  images: string[];
}

/** Listing image gallery — horizontal paging, rounded bottom. */
export function ListingImageCarousel({ images }: ListingImageCarouselProps) {
  if (images.length === 0) {
    return (
      <View style={[styles.slide, styles.placeholder]}>
        <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.carousel}
    >
      {images.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={styles.slide}
          contentFit="cover"
          transition={200}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: {
    width: SCREEN_WIDTH,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
