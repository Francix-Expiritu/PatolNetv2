import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { BASE_URL } from '../../config'; // Assuming BASE_URL is defined here
import type { RootStackParamList } from "./app";

// Define the Incident interface based on the required columns
interface Incident {
  ID: string;
  Incident: string; // Assuming this is the incident name/title
  Type: string;
  ReportedBy: string; // Changed from 'Reported By' to 'ReportedBy' for property naming
  Location: string;
  Status: string;
  // Actions will be a UI element, not a data property
}

type IncidentReportListRouteProp = RouteProp<RootStackParamList, "IncidentReportList">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "IncidentReportList">;

const IncidentReportList: React.FC = () => {
  const route = useRoute<IncidentReportListRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { username } = route.params;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // Assuming an API endpoint to fetch all incidents
      const response = await axios.get(`${BASE_URL}/api/incidents`);
      console.log("API Response Data:", response.data); // Log the response data
      setIncidents(response.data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Failed to load incidents. Please try again later.");
      Alert.alert("Error", "Failed to load incidents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (incidentId: string) => {
    // Navigate to a detailed incident view, passing the incident ID
    // Assuming an 'IncidentDetail' screen exists in RootStackParamList
    // If not, you'll need to create it and add it to RootStackParamList in app.tsx
    navigation.navigate("IncidentReport", { username, incidentId: parseInt(incidentId), isViewMode: true });
  };

  const renderIncidentItem = ({ item }: { item: Incident }) => {
    console.log("Rendering item:", item); // Log each item being rendered
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.idCell]}>{item.ID}</Text>
        <Text style={[styles.cell, styles.incidentCell]}>{item.Incident}</Text>
        <Text style={[styles.cell, styles.typeCell]}>{item.Type}</Text>
        <Text style={[styles.cell, styles.reportedByCell]}>{item.ReportedBy}</Text>
        <Text style={[styles.cell, styles.locationCell]}>{item.Location}</Text>
        <Text style={[styles.cell, styles.statusCell]}>{item.Status}</Text>
        <TouchableOpacity onPress={() => handleViewDetails(item.ID)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading incidents...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchIncidents} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incident Reports for {username}</Text>
      
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.idCell]}>ID</Text>
        <Text style={[styles.headerCell, styles.incidentCell]}>Incident</Text>
        <Text style={[styles.headerCell, styles.typeCell]}>Type</Text>
        <Text style={[styles.headerCell, styles.reportedByCell]}>Reported By</Text>
        <Text style={[styles.headerCell, styles.locationCell]}>Location</Text>
        <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
        <Text style={[styles.headerCell, styles.actionsCell]}>Actions</Text>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item, index) => (item.ID ? item.ID.toString() : index.toString())}
        renderItem={renderIncidentItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>No incident reports found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  cell: {
    paddingHorizontal: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  idCell: {
    width: '10%',
  },
  incidentCell: {
    width: '25%',
  },
  typeCell: {
    width: '15%',
  },
  reportedByCell: {
    width: '20%',
  },
  locationCell: {
    width: '15%',
  },
  statusCell: {
    width: '15%',
  },
  actionsCell: {
    width: '10%',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginLeft: 'auto', // Push to the right
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});

export default IncidentReportList;