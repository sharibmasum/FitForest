import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import treeAnimation from '../../components/tree/TestTree.json';

export default function TreeAnimation({ streak = 0 }) {
  const animationRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (animationRef.current) {
      // Calculate the target frame based on streak (max 39 frames)
      const targetFrame = Math.min(streak, 39);
      
      // Start animation from frame 0 to target frame and loop
      animationRef.current.play(0, targetFrame, true);
    }
  }, [streak]);

  const toggleAnimation = () => {
    if (animationRef.current) {
      if (isPaused) {
        animationRef.current.play();
      } else {
        animationRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  return (
    <View className="w-full h-64 items-center justify-center">
      <LottieView
        ref={animationRef}
        source={treeAnimation}
        autoPlay={true}
        loop={true}
        speed={1}
        style={{ width: '100%', height: '100%' }}
      />
      <TouchableOpacity
        onPress={toggleAnimation}
        className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm"
      >
        <Ionicons
          name={isPaused ? "play" : "pause"}
          size={24}
          color="#556B2F"
        />
      </TouchableOpacity>
    </View>
  );
} 