import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "./app";
import { BASE_URL } from "../../config";

type TimeInRouteProp = RouteProp<RootStackParamList, "TimeIn">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TimeIn">;

interface UserTimeStatus {
  schedule: {
    id: number;
    user: string;
    status: string;
    scheduledTime: string | null;
  };
  logs: {
    timeIn: {
      time: string;
      action: string;
    } | null;
    timeOut: {
      time: string;
      action: string;
    } | null;
  };
  currentTime: string;
  hasTimeInToday: boolean;
  hasTimeOutToday: boolean;
}

const TanodAttendance: React.FC = () => {
  const route = useRoute<TimeInRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const username = route.params?.username || "";
  
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [userStatus, setUserStatus] = useState<UserTimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for active status
  useEffect(() => {
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    if (userStatus?.hasTimeInToday && !userStatus?.hasTimeOutToday) {
      startPulse();
    }
  }, [userStatus, pulseAnim]);

  // Update current time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user's log status
  useEffect(() => {
    fetchUserTimeStatus();
  }, [username]);

  const fetchUserTimeStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/user-time-status/${username}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserStatus(data);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch user status");
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRecord = async (action: 'TIME-IN' | 'TIME-OUT') => {
    if (submitting) return;

    // Validation checks
    if (action === 'TIME-IN' && userStatus?.hasTimeInToday) {
      Alert.alert("Already On Duty", "You are already on duty today. Please time out first if you need to leave.");
      return;
    }

    if (action === 'TIME-OUT' && !userStatus?.hasTimeInToday) {
      Alert.alert("Not On Duty", "You need to time in first before you can end your shift.");
      return;
    }

    if (action === 'TIME-OUT' && userStatus?.hasTimeOutToday) {
      Alert.alert("Shift Ended", "Your shift has already ended for today.");
      return;
    }

    const currentTimeFormatted = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const actionText = action === 'TIME-IN' ? 'start your shift' : 'end your shift';
    const statusText = action === 'TIME-IN' ? 'ON DUTY' : 'OFF DUTY';

    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${actionText}?\n\nTime: ${currentTimeFormatted}\nStatus will change to: ${statusText}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: async () => {
            try {
              setSubmitting(true);
              
              const response = await fetch(`${BASE_URL}/api/time-record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: username,
                  action: action
                }),
              });

              const data = await response.json();

              if (response.ok) {
                const successMessage = action === 'TIME-IN' 
                  ? `Welcome to your shift! You are now ON DUTY as of ${new Date(data.time).toLocaleTimeString()}`
                  : `Shift ended successfully. You are now OFF DUTY as of ${new Date(data.time).toLocaleTimeString()}`;

                Alert.alert(
                  "Success", 
                  successMessage,
                  [{ text: "OK", onPress: () => fetchUserTimeStatus() }]
                );
              } else {
                Alert.alert("Error", data.message || `Failed to record ${action}`);
              }
            } catch (error) {
              console.error("Error recording time:", error);
              Alert.alert("Error", "Failed to connect to server");
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const formatScheduleTime = (timeString: string | null) => {
    if (!timeString) return "No schedule assigned";
    
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid schedule";
    }
  };

  const formatLogTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const getStatusInfo = () => {
    const hasTimeIn = userStatus?.hasTimeInToday;
    const hasTimeOut = userStatus?.hasTimeOutToday;

    if (hasTimeIn && !hasTimeOut) {
      return {
        text: 'ON DUTY',
        color: '#28a745',
        bgColor: '#d4edda',
        icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap
      };
    } else if (hasTimeOut) {
      return {
        text: 'SHIFT ENDED',
        color: '#6c757d',
        bgColor: '#f8f9fa',
        icon: 'shield-outline' as keyof typeof Ionicons.glyphMap
      };
    } else {
      return {
        text: 'OFF DUTY',
        color: '#dc3545',
        bgColor: '#f8d7da',
        icon: 'shield-outline' as keyof typeof Ionicons.glyphMap
      };
    }
  };

  const canTimeIn = !userStatus?.hasTimeInToday;
  const canTimeOut = userStatus?.hasTimeInToday && !userStatus?.hasTimeOutToday;
  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tanod Attendance</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading attendance data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tanod Attendance</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchUserTimeStatus}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Time Display */}
        <View style={styles.dateTimeCard}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>

        {/* Status Card */}
        <Animated.View style={[
          styles.statusCard,
          { backgroundColor: statusInfo.bgColor },
          userStatus?.hasTimeInToday && !userStatus?.hasTimeOutToday && {
            transform: [{ scale: pulseAnim }]
          }
        ]}>
          <View style={styles.statusHeader}>
            <Ionicons name={statusInfo.icon} size={28} color={statusInfo.color} />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
          
          {userStatus?.schedule.scheduledTime && (
            <View style={styles.scheduleInfo}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.scheduleText}>
                Scheduled: {formatScheduleTime(userStatus.schedule.scheduledTime)}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Today's Records */}
        {(userStatus?.logs.timeIn || userStatus?.logs.timeOut) && (
          <View style={styles.recordsCard}>
            <Text style={styles.recordsTitle}>Today's Records</Text>
            
            {userStatus?.logs.timeIn && (
              <View style={styles.recordItem}>
                <View style={styles.recordIcon}>
                  <Ionicons name="enter-outline" size={20} color="#28a745" />
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordAction}>TIME IN</Text>
                  <Text style={styles.recordTime}>
                    {formatLogTime(userStatus.logs.timeIn.time)}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              </View>
            )}
            
            {userStatus?.logs.timeOut && (
              <View style={styles.recordItem}>
                <View style={styles.recordIcon}>
                  <Ionicons name="exit-outline" size={20} color="#dc3545" />
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordAction}>TIME OUT</Text>
                  <Text style={styles.recordTime}>
                    {formatLogTime(userStatus.logs.timeOut.time)}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#dc3545" />
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Time In Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.timeInButton,
              !canTimeIn && styles.actionButtonDisabled
            ]}
            onPress={() => handleTimeRecord('TIME-IN')}
            disabled={!canTimeIn || submitting}
          >
            <View style={styles.actionButtonContent}>
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={canTimeIn ? "enter-outline" : "checkmark-circle"} 
                    size={24} 
                    color={canTimeIn ? "#fff" : "#28a745"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    !canTimeIn && styles.actionButtonTextDisabled
                  ]}>
                    {canTimeIn ? "START SHIFT" : "ALREADY ON DUTY"}
                  </Text>
                  <Text style={[
                    styles.actionButtonSubtext,
                    !canTimeIn && styles.actionButtonTextDisabled
                  ]}>
                    {canTimeIn ? "Tap to begin your duty" : "Shift has started"}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Time Out Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.timeOutButton,
              !canTimeOut && styles.actionButtonDisabled
            ]}
            onPress={() => handleTimeRecord('TIME-OUT')}
            disabled={!canTimeOut || submitting}
          >
            <View style={styles.actionButtonContent}>
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={canTimeOut ? "exit-outline" : userStatus?.hasTimeOutToday ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={canTimeOut ? "#fff" : userStatus?.hasTimeOutToday ? "#28a745" : "#dc3545"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    !canTimeOut && styles.actionButtonTextDisabled
                  ]}>
                    {canTimeOut ? "END SHIFT" : userStatus?.hasTimeOutToday ? "SHIFT ENDED" : "NOT AVAILABLE"}
                  </Text>
                  <Text style={[
                    styles.actionButtonSubtext,
                    !canTimeOut && styles.actionButtonTextDisabled
                  ]}>
                    {canTimeOut ? "Tap to end your duty" : 
                     userStatus?.hasTimeOutToday ? "Duty completed" : "Time in first"}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="information-circle" size={16} color="#007bff" />
            <Text style={styles.instructionText}>
              Tap "START SHIFT" when you begin your duty
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="information-circle" size={16} color="#007bff" />
            <Text style={styles.instructionText}>
              Tap "END SHIFT" when your duty is complete
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="information-circle" size={16} color="#007bff" />
            <Text style={styles.instructionText}>
              Your attendance is automatically recorded
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#2c3e50",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateTimeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  timeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statusCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  scheduleText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  recordsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  recordDetails: {
    flex: 1,
  },
  recordAction: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  recordTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  timeInButton: {
    backgroundColor: "#28a745",
  },
  timeOutButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonDisabled: {
    backgroundColor: "#e9ecef",
    shadowOpacity: 0,
    elevation: 1,
  },
  actionButtonContent: {
    padding: 20,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  actionButtonSubtext: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  actionButtonTextDisabled: {
    color: "#6c757d",
  },
  instructionsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});

export default TanodAttendance;