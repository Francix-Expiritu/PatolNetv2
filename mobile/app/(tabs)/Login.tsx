import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native";
import * as Location from 'expo-location'; // Import expo-location


type RootStackParamList = {
  Login: undefined;
  Home: { username: string; userData: any };
  IncidentReport: { username: string };
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Login: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");  
  const [loading, setLoading] = useState(false);

  const handleSosPress = async () => {
    Alert.alert("Emergency SOS", "Initiating emergency access...");
    
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Cannot send SOS.');
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Perform reverse geocoding to get human-readable address
      let address = 'Not Available';
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (geocode && geocode.length > 0) {
          const { street, streetNumber, city, region, country } = geocode[0];
          address = `${streetNumber ? streetNumber + ' ' : ''}${street || ''}, ${city || ''}, ${region || ''}, ${country || ''}`.trim();
          if (address === ", , ,") { // Fallback if all parts are empty
            address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          }
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding error:', geocodeError);
        address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`; // Fallback to coordinates
      }

      // Retrieve user data from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUsername = await AsyncStorage.getItem('username');

      if (!storedUserId || !storedUsername) {
        Alert.alert('Error', 'User data not found. Please log in again.');
        return;
      }

      // Send SOS report to backend
      const response = await axios.post("http://192.168.100.3:3001/sos-report", {
        userId: storedUserId,
        username: storedUsername,
        latitude,
        longitude,
        location: address, // Send the human-readable address
      });

      if (response.data.success) {
        Alert.alert('SOS Sent', 'Emergency report sent successfully to admin.');
      } else {
        Alert.alert('SOS Failed', response.data.message || 'Failed to send emergency report.');
      }

    } catch (error: any) {
      console.error('SOS error:', error);
      Alert.alert('SOS Error', 'Something went wrong while sending SOS. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter username and password");
      return;
    }

    setLoading(true);
    try {
        const response = await axios.post("http://192.168.100.3:3001/login", {
          username,
          password,
          clientType: 'mobile' // Specify this is a mobile client request
        });

        if (response.data.success) {
          const userData = response.data.user;
          
          // Verify user role is allowed for mobile (Tanod or Resident)
          if (!['Tanod', 'Resident'].includes(userData.role)) {
            Alert.alert(
              "Access Denied", 
              "Only Tanod and Resident users are allowed to access the mobile application."
            );
            setLoading(false);
            return;
          }

          // Store user data in AsyncStorage
          try {
            await AsyncStorage.multiSet([
              ['username', username],
              ['userRole', userData.role],
              ['userId', userData.id.toString()],
              ['userName', userData.name],
              ['userEmail', userData.email],
              ['userAddress', userData.address || ''],
              ['userStatus', userData.status],
              ['userImage', userData.image || '']
            ]);

            console.log('Login successful, stored user data:', {
              username: username,
              userRole: userData.role,
              userId: userData.id,
              userName: userData.name
            });

            // Role-based navigation
              if (userData.role === 'Resident') {
                // Redirect Residents to Home instead of IncidentReport
                navigation.navigate("Home", { 
                  username, 
                  userData: userData 
                });
              } else if (userData.role === 'Tanod') {
                // Redirect Tanod to Home
                navigation.navigate("Home", { 
                  username, 
                  userData: userData 
                });
              }

          } catch (storageError) {
            console.error('Error storing user data:', storageError);
            Alert.alert("Warning", "Login successful but failed to save user data locally.");
            
            // Still perform role-based navigation even if storage fails
                if (userData.role === 'Resident') {
                  navigation.navigate("Home", { 
                    username, 
                    userData: userData 
                  });
                } else if (userData.role === 'Tanod') {
                  navigation.navigate("Home", { 
                    username, 
                    userData: userData 
                  });
                }
          }
        }
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error.response?.status === 401) {
          Alert.alert("Login Failed", "Invalid username or password");
        } else if (error.response?.status === 403) {
          Alert.alert("Access Denied", error.response.data.error);
        } else if (error.response?.status === 400) {
          Alert.alert("Invalid Request", error.response.data.error || "Please check your input");
        } else {
          Alert.alert("Error", "Something went wrong. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
  };

return (
  <SafeAreaView style={styles.safeContainer}>
  <View style={styles.loginContainer}>
    <View style={styles.loginBox}>
 <View style={styles.headerSection}>
  <Image
    source={require('./logo.jpg')}
    style={styles.logoImage}
    resizeMode="contain"
  />
  <Text style={styles.appTitle}>PatrolNet</Text>
  <Text style={styles.appSubtitle}>Emergency Response System</Text>
  <Text style={styles.welcomeText}>Mobile Access - Tanod & Residents</Text>
</View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.inputBox}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#ffffffff"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔐</Text>
            <TextInput
              style={styles.inputBox}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#ffffffff"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.loadingText}>AUTHENTICATING...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Emergency SOS Circle */}
        <TouchableOpacity 
          style={styles.sosCircle} 
          onPress={handleSosPress}
          activeOpacity={0.8}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>


        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerLabel}>Need an account?</Text>
          <TouchableOpacity 
            onPress={() => navigation.replace("Register")}
            style={styles.createAccountButton}
            activeOpacity={0.7}
          >
            <Text style={styles.createAccountText}>REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Badge 
      <View style={styles.securityBadge}>
        <Text style={styles.securityIcon}>📱</Text>
        <Text style={styles.securityText}>MOBILE SECURE ACCESS</Text>
      </View>
*/}
      {/* Status Indicator 
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>SYSTEM OPERATIONAL</Text>
      </View>*/}
    </View>
  </View>
  
          </SafeAreaView>
);
};

const styles = StyleSheet.create({
  safeContainer: {
  flex: 1,
  backgroundColor: "#0F172A",
},

sosCircle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#DC2626",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  marginTop: 24,
  shadowColor: "#DC2626",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.6,
  shadowRadius: 10,
  elevation: 8,
},
sosText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: 2,
},


  loginContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loginBox: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  logoInner: {
    width: 100,
    height: 100,
    backgroundColor: "#DC2626",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FEF2F2",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  logoAccent: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    top: 0,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 4,
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    color: "#DC2626",
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#ffffffff",
  },
  inputBox: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    height: "100%",
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: 1,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    marginTop: 16,
  },
  emergencyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    letterSpacing: 1,
  },
  footerSection: {
    alignItems: "center",
    marginTop: 24,
  },
  footerLabel: {
    fontSize: 14,
    color: "#ffffffff",
    marginBottom: 8,
  },
  createAccountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createAccountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#22C55E",
    letterSpacing: 1,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: "#22C55E",
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#22C55E",
    letterSpacing: 0.5,
  },
  logoImage: {
  width: 100,
  height: 100,
  borderRadius: 50, // Makes it circular if your logo is square
  marginBottom: 24,
  backgroundColor: "#3B82F6", // Optional fallback
},
});

export default Login;