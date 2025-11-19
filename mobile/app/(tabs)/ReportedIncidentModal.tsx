// ReportedIncidentModal.tsx - Modal for viewing reported incidents status
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IncidentReport {
  id: number;
  type: string;
  reported_by: string;
  location: string;
  status: string;
  assigned: string;
  created_at: string;
  resolved_by?: string;
  resolved_at?: string;
}

interface ReportedIncidentModalProps {
  isVisible: boolean;
  incident: IncidentReport | null;
  userRole: string;
  username: string;
  onClose: () => void;
  onResolve?: () => void;
  onResolveAsAdmin?: () => void;
}

const ReportedIncidentModal: React.FC<ReportedIncidentModalProps> = ({
  isVisible,
  incident,
  userRole,
  username,
  onClose,
  onResolve,
  onResolveAsAdmin,
}) => {
  if (!incident) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      }),
    };
  };

  const createdDateTime = formatDateTime(incident.created_at);
  const resolvedDateTime = incident.resolved_at ? formatDateTime(incident.resolved_at) : null;
  const isResolved = incident.status === 'Resolved';
  const isResolvedByAdmin = incident.resolved_by === 'Admin';

  const handleResolve = () => {
    Alert.alert(
      "Confirm Resolution",
      "Are you sure you want to mark this incident as resolved?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            if (onResolve) onResolve();
          },
        },
      ]
    );
  };

  const handleResolveAsAdmin = () => {
    Alert.alert(
      "Confirm Admin Resolution",
      "Are you sure you want to mark this incident as resolved by Admin?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            if (onResolveAsAdmin) onResolveAsAdmin();
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (isResolved) return "#4CAF50";
    if (incident.assigned) return "#FF9800";
    return "#F44336";
  };

  const getStatusIcon = () => {
    if (isResolved) return "checkmark-circle";
    if (incident.assigned) return "time";
    return "alert-circle";
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="document-text" size={24} color="#2196F3" />
            </View>
            <Text style={styles.modalTitle}>Your Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {isResolved && isResolvedByAdmin 
                  ? 'Marked as Resolved by Admin' 
                  : incident.status}
              </Text>
            </View>

            {/* Incident Type */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Incident Type</Text>
              <Text style={styles.detailValue}>{incident.type}</Text>
            </View>

            {/* Location */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Location</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={18} color="#2196F3" />
                <Text style={[styles.detailValue, styles.locationText]}>
                  {incident.location}
                </Text>
              </View>
            </View>

            {/* Reported Date */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reported On</Text>
              <Text style={styles.detailValue}>{createdDateTime.date}</Text>
              <Text style={styles.detailSubValue}>{createdDateTime.time}</Text>
            </View>

            <View style={styles.divider} />

            {/* Assignment Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>
                {incident.assigned ? 'Assigned To' : 'Assignment Status'}
              </Text>
              {incident.assigned ? (
                <View style={styles.assignedContainer}>
                  <Ionicons name="person" size={18} color="#4CAF50" />
                  <Text style={[styles.detailValue, { marginLeft: 8 }]}>
                    {incident.assigned}
                  </Text>
                </View>
              ) : (
                <View style={styles.notAssignedContainer}>
                  <Ionicons name="hourglass-outline" size={18} color="#FF9800" />
                  <Text style={[styles.detailValue, { marginLeft: 8, color: "#FF9800" }]}>
                    {isResolvedByAdmin ? 'N/A' : 'Awaiting assignment'}
                  </Text>
                </View>
              )}
            </View>

            {/* Resolution Info */}
            {isResolved && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Resolved By</Text>
                  <Text style={[styles.detailValue, { color: "#4CAF50" }]}>
                    {incident.resolved_by}
                  </Text>
                </View>

                {resolvedDateTime && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Resolved On</Text>
                    <Text style={styles.detailValue}>{resolvedDateTime.date}</Text>
                    <Text style={styles.detailSubValue}>{resolvedDateTime.time}</Text>
                  </View>
                )}
              </>
            )}

            {/* Info Box */}
            {!isResolved && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#2196F3" />
                <Text style={styles.infoText}>
                  {incident.assigned 
                    ? 'Your report has been assigned and is being reviewed.'
                    : 'Your report is pending assignment. You will be notified of updates.'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer with Actions */}
          <View style={styles.modalFooter}>
            {!isResolved && userRole === 'Tanod' && onResolve && (
              <TouchableOpacity style={styles.resolveButton} onPress={handleResolve}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
              </TouchableOpacity>
            )}

            {!isResolved && userRole === 'Admin' && onResolveAsAdmin && (
              <TouchableOpacity style={styles.resolveAdminButton} onPress={handleResolveAsAdmin}>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.resolveButtonText}>Resolve as Admin</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.closeButtonFull, (!isResolved && (userRole === 'Tanod' || userRole === 'Admin')) && styles.closeButtonSecondary]} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f0f8ff",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1565C0",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  detailSubValue: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 6,
    flex: 1,
  },
  assignedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    padding: 10,
    borderRadius: 8,
  },
  notAssignedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    padding: 10,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 15,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  resolveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  resolveAdminButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  resolveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  closeButtonFull: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonSecondary: {
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ReportedIncidentModal;