// Profile.tsx - Redesigned with modern UI and improved layout
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "./app";
import { BASE_URL } from "../../config";

const { width: screenWidth } = Dimensions.get('window');

type ProfileRouteProp = RouteProp<RootStackParamList, "Profile">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  ID: string;
  USER: string;
  NAME: string;
  EMAIL: string;
  ADDRESS: string;
  ROLE: string;
  STATUS: string;
  IMAGE?: string;
}

const Profile: React.FC = () => {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const username = route.params?.username || "";
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form fields
  const [formUsername, setFormUsername] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserData();
  }, [username]);
  
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/user/${username}`);
      
      if (response.data) {
        setUserData(response.data);
        setFormUsername(response.data.USER || "");
        setFormName(response.data.NAME || "");
        setFormEmail(response.data.EMAIL || "");
        setFormAddress(response.data.ADDRESS || "");
        setImage(response.data.IMAGE ? `${BASE_URL}/uploads/${response.data.IMAGE}` : null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!formUsername || !formName || !formEmail || !formAddress) {
      Alert.alert("Missing fields", "Please fill in all required fields");
      return;
    }
    
    if (formPassword && formPassword !== confirmPassword) {
      Alert.alert("Password error", "Passwords do not match");
      return;
    }
    
    setUpdating(true);
    
    try {
      const formData = new FormData();
      
      formData.append("username", formUsername);
      formData.append("name", formName);
      formData.append("email", formEmail);
      formData.append("address", formAddress);
      
      if (formPassword) {
        formData.append("password", formPassword);
      }
      
      if (image && !image.startsWith("http")) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append("image", {
          uri: image,
          name: `profile-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
      
      const response = await axios.put(
        `${BASE_URL}/api/users/${userData?.ID}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      if (response.data.success) {
        Alert.alert(
          "Success", 
          "Profile updated successfully. You will be logged out to apply changes.",
          [
            {
              text: "OK",
              onPress: () => handleAutoLogout()
            }
          ]
        );
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert("Error", "Username already exists");
      } else {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile");
      }
    } finally {
      setUpdating(false);
    }
  };
  
  const handleAutoLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };
  
  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera roll permission is needed to upload images");
        return;
      }
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#f44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'shield';
      case 'user': return 'person';
      case 'manager': return 'briefcase';
      default: return 'person';
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Profile</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Ionicons 
            name={editMode ? "close" : "create-outline"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={editMode ? pickImage : undefined}
            disabled={!editMode}
            activeOpacity={editMode ? 0.7 : 1}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={50} color="#9ca3af" />
              </View>
            )}
            
            {editMode && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          {!editMode && (
            <View style={styles.nameSection}>
              <Text style={styles.displayName}>{userData?.NAME}</Text>
              <Text style={styles.displayUsername}>@{userData?.USER}</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(userData?.STATUS || '') }]} />
                <Text style={styles.statusText}>{userData?.STATUS}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        {editMode ? (
          // Edit Mode
          <View style={styles.editContainer}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.inputField}
                    value={formUsername}
                    onChangeText={setFormUsername}
                    placeholder="Enter username"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="text-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.inputField}
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Enter full name"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.inputField}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.inputField, styles.multilineInput]}
                    value={formAddress}
                    onChangeText={setFormAddress}
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>

            {/* Password Section */}
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.inputField}
                    value={formPassword}
                    onChangeText={setFormPassword}
                    placeholder="Leave blank to keep current"
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.inputField}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // View Mode
          <View style={styles.viewContainer}>
            {/* Personal Information Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person-outline" size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>{userData?.USER}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="text-outline" size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{userData?.NAME}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail-outline" size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData?.EMAIL}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{userData?.ADDRESS}</Text>
                </View>
              </View>
            </View>

            {/* Account Details Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Account Details</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name={getRoleIcon(userData?.ROLE || '')} size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{userData?.ROLE}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#6366f1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Account Status</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(userData?.STATUS || '') }]} />
                    <Text style={[styles.statusValue, { color: getStatusColor(userData?.STATUS || '') }]}>
                      {userData?.STATUS}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    backgroundColor: "#6366f1",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
    marginHorizontal: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366f1",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nameSection: {
    alignItems: "center",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  displayUsername: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    textTransform: "capitalize",
  },
  editContainer: {
    paddingHorizontal: 20,
  },
  viewContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    marginTop: 8,
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputIcon: {
    marginTop: 24,
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputField: {
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 22,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

export default Profile;