// Celebration.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const EMOJIS = ['🥵', '🎉', '🍑', '💦', '💋'];
const NUM_EMOJIS = 15;

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  origin: { x: number; y: number };
}

interface EmojiAnimation {
    anim: Animated.Value;
    initialDeltaX: number;
    initialDeltaY: number;
    landingYVariation: number;
    dripDuration: number;
    emoji: string;
  }

export const Celebration: React.FC<CelebrationProps> = ({ visible, onComplete, origin }) => {
  const [animations, setAnimations] = useState<EmojiAnimation[]>([]);
  const animationsRef = useRef<EmojiAnimation[]>([]);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const margin = 20;
  const verticalOffset = 0; // Remove the offset since we're using exact touch coordinates

  useEffect(() => {
    if (visible) {
      console.log('Celebration visible, starting animation...');
      const newAnimations: EmojiAnimation[] = Array(NUM_EMOJIS)
      .fill(0)
      .map(() => {
        // Calculate initial spread (all emojis shoot up and out)
        const spreadAngle = (Math.random() - 0.5) * 90; // -45 to 45 degrees
        const spreadDistance = 150 + Math.random() * 100; // 150-250 pixels spread
        const radians = (spreadAngle * Math.PI) / 180;
        
        // Calculate spread using trigonometry
        const initialDeltaX = Math.sin(radians) * spreadDistance;
        // Make sure they all go very high, almost to top of screen
        const initialDeltaY = -Math.min(origin.y - margin - 50, screenHeight * 0.8);
        
        // Add random variation to the landing spot
        const landingYVariation = Math.abs(Math.random() * initialDeltaX * 0.3); // Higher Y variation for emojis that spread more

        // Ensure emojis don't go beyond screen edges
        const maxLeftDeltaX = -(origin.x - margin);
        const maxRightDeltaX = screenWidth - origin.x - margin;
        const boundedDeltaX = Math.min(Math.max(initialDeltaX, maxLeftDeltaX), maxRightDeltaX);

        // Random drip duration for each emoji
        const dripDuration = 3000 + Math.random() * 1000; // 3-4 seconds

        return {
          anim: new Animated.Value(0),
          initialDeltaX: boundedDeltaX,
          initialDeltaY,
          landingYVariation: Math.max(-50, Math.min(50, landingYVariation)), // Clamp between -50 and 50
          dripDuration,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        };
      });

      animationsRef.current = newAnimations;
      setAnimations(newAnimations);

      const animationSequence = newAnimations.map(({ anim, dripDuration }) => {
        return Animated.sequence([
          Animated.delay(Math.random() * 100), // Slight random delay at start
          // Quick shoot up
          Animated.timing(anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          // Slow drip down
          Animated.timing(anim, {
            toValue: 1,
            duration: dripDuration,
            useNativeDriver: true,
          }),
        ]);
      });

      // Wait for all animations to complete
      Animated.parallel(animationSequence).start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    }
    
    return () => {
      animationsRef.current.forEach(({ anim }) => {
        anim.setValue(0);
      });
    };
  }, [visible, origin.x, origin.y, screenWidth, screenHeight, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {animations.map(({ anim, initialDeltaX, initialDeltaY, landingYVariation, emoji }, index) => {
        // First shoot up, then drip down with random landing variation
        const translateY = anim.interpolate({
            inputRange: [0, 0.4, 0.5, 0.7, 1],
            outputRange: [
              0, 
              initialDeltaY, // Shoot up
              initialDeltaY * 0.6 + landingYVariation, // Start falling with variation
              initialDeltaY * 0.3 + landingYVariation * 1.2, // Create puddle effect
              landingYVariation * 1.5, // Final drip position
            ],
          });

        const translateX = anim.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, initialDeltaX, initialDeltaX],
        });

        const scale = anim.interpolate({
          inputRange: [0, 0.2, 0.4, 0.5, 0.8, 1],
          outputRange: [0.5, 1.2, 1, 1.1, 0.9, 0.7],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });

        return (
            <Animated.View
              key={index}
              style={[
                styles.emojiContainer,
                {
                  position: 'absolute',
                  left: origin.x - 12,
                  top: (origin.y - 12) - 100, // Add 50px upward offset to starting position
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                  ],
                  opacity,
                },
              ]}
            >
              <Animated.Text style={styles.emoji}>
                {emoji}
              </Animated.Text>
            </Animated.View>
          );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    zIndex: 999,
    elevation: 999,
  },
  emojiContainer: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 24,
  },
});