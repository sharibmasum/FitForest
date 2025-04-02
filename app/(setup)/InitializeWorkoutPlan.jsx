import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Pressable, Modal } from 'react-native';
import { useWorkoutPlan, DAYS_OF_WEEK } from '../../hooks/useWorkoutPlan';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('start');
  const [currentDay, setCurrentDay] = useState(null);
  const [times, setTimes] = useState({});
  const [tempTime, setTempTime] = useState({ start: '09:00', end: '10:00' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
      selectedDays.add(day);
      setSelectedDays(new Set(selectedDays));
      setCurrentDay(day);
      setTimePickerMode('start');
      setTempTime({ start: '09:00', end: '10:00' });
      setShowTimePicker(true);
    }
  };

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

  const handleConfirmTime = () => {
    setTimes(prev => ({
      ...prev,
      [currentDay]: { ...tempTime }
    }));
    setShowTimePicker(false);
    setUnsavedChanges(true);
  };

  const handleCancelTime = () => {
    if (!times[currentDay]) {
      selectedDays.delete(currentDay);
      setSelectedDays(new Set(selectedDays));
    }
    setShowTimePicker(false);
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
            // Update existing day
            await updateWorkoutDay(existingPlan.id, {
              startTime: times[day].start,
              endTime: times[day].end
            });
          } else {
            // Add new day
            await addWorkoutDay({
              day,
              startTime: times[day].start,
              endTime: times[day].end
            });
          }
        }
      }
      
      // Navigate to home
      router.replace('/(tabs)/TreeHome');
    } catch (error) {
      console.error('Error saving workout plan:', error);
      // You might want to show an error toast here
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
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
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
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayPress(day)}
                  className={`flex-row items-center justify-between p-4 mb-4 rounded-lg border ${
                    selectedDays.has(day)
                      ? 'bg-[#556B2F] border-[#556B2F]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-lg capitalize ${
                      selectedDays.has(day) ? 'text-white font-medium' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </Text>
                  
                  {selectedDays.has(day) && times[day] && (
                    <View className="flex-row items-center">
                      <Text className={selectedDays.has(day) ? 'text-white' : 'text-gray-700'}>
                        {formatTime(times[day].start)} - {formatTime(times[day].end)}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="white"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
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

            {showTimePicker && Platform.OS === 'ios' && (
              <View className="absolute bottom-[85px] left-0 right-0 bg-white border-t border-gray-200">
                <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100">
                  <TouchableOpacity onPress={handleCancelTime}>
                    <Text className="text-[#556B2F] text-lg">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-gray-600 font-medium">
                    Set {timePickerMode === 'start' ? 'Start' : 'End'} Time
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (timePickerMode === 'start') {
                        setTimePickerMode('end');
                      } else {
                        handleConfirmTime();
                      }
                    }}
                  >
                    <Text className="text-[#556B2F] text-lg font-medium">
                      {timePickerMode === 'start' ? 'Next' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={(() => {
                    const [hours, minutes] = (timePickerMode === 'start' ? tempTime.start : tempTime.end).split(':');
                    const date = new Date();
                    date.setHours(parseInt(hours), parseInt(minutes));
                    return date;
                  })()}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
            )}

            {/* Information Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={showInfoModal}
              onRequestClose={() => setShowInfoModal(false)}
            >
              <TouchableOpacity
                className="flex-1 justify-center items-center bg-black/50"
                activeOpacity={1}
                onPress={() => setShowInfoModal(false)}
              >
                <View className="bg-white mx-4 p-6 rounded-xl shadow-lg">
                  <View className="flex-row justify-between items-start mb-4">
                    <Text className="text-xl font-semibold text-[#556B2F] flex-1 mr-4">
                      Workout Days Information
                    </Text>
                    <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                      <Ionicons name="close" size={24} color="#556B2F" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-gray-700 leading-6">
                    Select the days of the week and the preferred time. This will tell FitForest which days to track and which days are considered rest days. Rest days will have no effect on the tree, the more workout days, the more your tree will grow.
                  </Text>
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      </SafeAreaView>

      {showTimePicker && Platform.OS === 'android' && (
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
    </View>
  );
} 