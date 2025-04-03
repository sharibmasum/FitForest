import { useState, useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';

export default function useTimePicker() {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('start');
  const [currentDay, setCurrentDay] = useState(null);
  const [tempTime, setTempTime] = useState({ start: '09:00', end: '10:00' });
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showTimePicker) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    }
  }, [showTimePicker]);

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed' || !selectedTime) {
      return;
    }

    const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
    
    if (timePickerMode === 'start') {
      setTempTime(prev => ({ ...prev, start: timeString }));
    } else {
      setTempTime(prev => ({ ...prev, end: timeString }));
    }
  };

  const animateAndHide = (callback) => {
    if (Platform.OS === 'ios') {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start(() => {
        callback();
        setShowTimePicker(false);
      });
    } else {
      // For Android, we don't need animation
      callback();
      setShowTimePicker(false);
    }
  };

  return {
    showTimePicker,
    setShowTimePicker,
    timePickerMode,
    setTimePickerMode,
    currentDay,
    setCurrentDay,
    tempTime,
    setTempTime,
    slideAnim,
    handleTimeChange,
    animateAndHide
  };
} 