import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useWorkoutPlan, DAYS_OF_WEEK } from '../../hooks/useWorkoutPlan';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import TimePickerModal from '../../components/ui/TimePickerModal';
import DaySelector from '../../components/ui/DaySelector';
import useTimePicker from '../../hooks/useTimePicker';
import InfoModal from '../../components/ui/InfoModal';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function InitializeWorkoutPlan() {
  const router = useRouter();
  const {
    workoutPlan,
    loading,
    error,
    fetchWorkoutPlan,
    addWorkoutDay,
    deleteWorkoutDay,
    updateWorkoutDay,
  } = useWorkoutPlan();

  const [selectedDays, setSelectedDays] = useState(new Set());
  const [times, setTimes] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
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
  } = useTimePicker();

  useEffect(() => {
    fetchWorkoutPlan();
  }, []);

  useEffect(() => {
    if (workoutPlan.length > 0) {
      const days = new Set(workoutPlan.map(plan => plan.day));
      setSelectedDays(days);
      const newTimes = {};
      workoutPlan.forEach(plan => {
        newTimes[plan.day] = {
          start: plan.start_time || '09:00',
          end: plan.end_time || '10:00'
        };
      });
      setTimes(newTimes);
    }
  }, [workoutPlan]);

  const handleDayPress = async (day) => {
    if (selectedDays.has(day)) {
      selectedDays.delete(day);
      setSelectedDays(new Set(selectedDays));
      const newTimes = { ...times };
      delete newTimes[day];
      setTimes(newTimes);
      setUnsavedChanges(true);
    } else {
      const newSelectedDays = new Set(selectedDays);
      newSelectedDays.add(day);
      setSelectedDays(newSelectedDays);
      setCurrentDay(day);
      setTimePickerMode('start');
      setTempTime({ start: '09:00', end: '10:00' });
      setShowTimePicker(true);
    }
  };

  const handleCancelTime = () => {
    animateAndHide(() => {
      if (!times[currentDay]) {
        selectedDays.delete(currentDay);
        setSelectedDays(new Set(selectedDays));
      }
    });
  };

  const handleConfirmTime = () => {
    animateAndHide(() => {
      const newTimes = { ...times };
      // Apply the time to all selected days
      Array.from(selectedDays).forEach(day => {
        newTimes[day] = { ...tempTime };
      });
      setTimes(newTimes);
      setUnsavedChanges(true);
    });
  };

  const handleNextStep = async () => {
    try {
      setUnsavedChanges(false);
      
      // Delete removed days
      const currentDays = Array.from(selectedDays);
      const daysToDelete = workoutPlan.filter(plan => !currentDays.includes(plan.day));
      
      for (const plan of daysToDelete) {
        await deleteWorkoutDay(plan.id);
      }
      
      // Add or update days
      for (const day of currentDays) {
        if (times[day]) {
          const existingPlan = workoutPlan.find(plan => plan.day === day);
          if (existingPlan) {
            await updateWorkoutDay(existingPlan.id, {
              startTime: times[day].start,
              endTime: times[day].end
            });
          } else {
            await addWorkoutDay({
              day,
              startTime: times[day].start,
              endTime: times[day].end
            });
          }
        }
      }
      
      // Always go to TreeHome after saving workout plan
      router.replace('/(tabs)/TreeHome');
    } catch (error) {
      console.error('Error saving workout plan:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#556B2F" />
          </View>
        ) : (
          <>
            <ScrollView className="flex-1 px-4">
              <View className="mb-6 mt-4">
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold text-[#556B2F]">
                    Set Up Your Workout Plan
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowInfoModal(true)}
                    className="ml-2 flex items-center justify-center h-9 mt-1"
                  >
                    <Ionicons name="information-circle-outline" size={24} color="#556B2F" />
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-600 mt-2">
                  Select the days you plan to workout and set your preferred time
                </Text>
              </View>

              {DAYS_OF_WEEK.map((day) => (
                <DaySelector
                  key={day}
                  day={day}
                  isSelected={selectedDays.has(day)}
                  times={times}
                  onPress={() => handleDayPress(day)}
                  formatTime={formatTime}
                />
              ))}
              <View className="h-32" />
            </ScrollView>

            <View className="absolute bottom-8 left-0 right-0 p-4 bg-white">
              <TouchableOpacity
                onPress={handleNextStep}
                disabled={!unsavedChanges || selectedDays.size === 0}
                className={`py-4 rounded-lg ${(unsavedChanges && selectedDays.size > 0) ? 'bg-[#556B2F]' : 'bg-gray-300'}`}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Finish Setup
                </Text>
              </TouchableOpacity>
            </View>

            <TimePickerModal
              showTimePicker={showTimePicker}
              timePickerMode={timePickerMode}
              tempTime={tempTime}
              slideAnim={slideAnim}
              onCancel={handleCancelTime}
              onConfirm={() => {
                if (timePickerMode === 'start') {
                  setTimePickerMode('end');
                } else {
                  handleConfirmTime();
                }
              }}
              onTimeChange={handleTimeChange}
              bottomPosition={40}
            />

            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = (timePickerMode === 'start' ? tempTime.start : tempTime.end).split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours), parseInt(minutes));
                  return date;
                })()}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (event.type !== 'dismissed' && selectedTime) {
                    const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
                    if (timePickerMode === 'start') {
                      setTempTime(prev => ({ ...prev, start: timeString }));
                      setTimePickerMode('end');
                      setShowTimePicker(true);
                    } else {
                      setTempTime(prev => ({ ...prev, end: timeString }));
                      handleConfirmTime();
                    }
                  } else {
                    handleCancelTime();
                  }
                }}
              />
            )}

            <InfoModal
              visible={showInfoModal}
              onClose={() => setShowInfoModal(false)}
              title="Workout Days Information"
              content="Select the days of the week and the preferred time. This will tell FitForest which days to track and which days are considered rest days. Rest days will have no effect on the tree, the more workout days, the more your tree will grow."
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
} 