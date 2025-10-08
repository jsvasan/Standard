import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface PersonalInfo {
  registrantName: string;
  registrantPhone: string;
  registrantAptNumber: string;
  dateOfBirth: string;
  bloodGroup: string;
  insurancePolicy: string;
  insuranceCompany: string;
  doctorName: string;
  doctorContact: string;
  hospitalName: string;
  hospitalNumber: string;
  currentAilments: string;
}

interface Buddy {
  name: string;
  phone: string;
  email: string;
  aptNumber: string;
}

interface NextOfKin {
  name: string;
  phone: string;
  email: string;
}

interface Registration {
  id: string;
  personalInfo: PersonalInfo;
  buddies: Buddy[];
  nextOfKin: NextOfKin[];
  createdAt: string;
}

export default function AdminRegistrations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Password verification modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', reg: Registration } | null>(null);
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    personalInfo: {} as PersonalInfo,
    buddies: [] as Buddy[],
    nextOfKin: [] as NextOfKin[],
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        showAlert('Error', 'Failed to fetch registrations');
      }
    } catch (error) {
      showAlert('Error', 'Network error. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      showAlert('Error', 'Please enter your admin password');
      return;
    }

    if (!pendingAction) return;

    setVerifying(true);
    try {
      if (pendingAction.type === 'edit') {
        // Initialize edit form data
        setEditFormData({
          personalInfo: { ...pendingAction.reg.personalInfo },
          buddies: [...pendingAction.reg.buddies],
          nextOfKin: [...pendingAction.reg.nextOfKin],
        });
        setEditingReg(pendingAction.reg);
        setShowPasswordModal(false);
        setShowEditModal(true);
      } else if (pendingAction.type === 'delete') {
        await performDelete(pendingAction.reg.id, password);
        setShowPasswordModal(false);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setVerifying(false);
      setPassword('');
      setPendingAction(null);
    }
  };

  const performDelete = async (registrationId: string, adminPassword: string) => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        showAlert('Success', 'Registration deleted successfully');
        await fetchRegistrations(); // Refresh list
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to delete registration');
      }
    } catch (error) {
      showAlert('Error', 'Network error. Please check your connection.');
      console.error(error);
    }
  };

  const handleUpdateRegistration = async () => {
    if (!editingReg) return;

    setUpdating(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/registrations/${editingReg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          personalInfo: editFormData.personalInfo,
          buddies: editFormData.buddies,
          nextOfKin: editFormData.nextOfKin,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Registration updated successfully');
        setShowEditModal(false);
        await fetchRegistrations(); // Refresh list
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to update registration');
      }
    } catch (error) {
      showAlert('Error', 'Network error. Please check your connection.');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const requestAction = (type: 'edit' | 'delete', reg: Registration) => {
    setPendingAction({ type, reg });
    setShowPasswordModal(true);
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateBuddy = (index: number, field: keyof Buddy, value: string) => {
    setEditFormData(prev => {
      const newBuddies = [...prev.buddies];
      newBuddies[index] = { ...newBuddies[index], [field]: value };
      return { ...prev, buddies: newBuddies };
    });
  };

  const updateNextOfKin = (index: number, field: keyof NextOfKin, value: string) => {
    setEditFormData(prev => {
      const newNextOfKin = [...prev.nextOfKin];
      newNextOfKin[index] = { ...newNextOfKin[index], [field]: value };
      return { ...prev, nextOfKin: newNextOfKin };
    });
  };

  const addBuddy = () => {
    if (editFormData.buddies.length < 2) {
      setEditFormData(prev => ({
        ...prev,
        buddies: [...prev.buddies, { name: '', phone: '', email: '', aptNumber: '' }],
      }));
    }
  };

  const removeBuddy = (index: number) => {
    if (editFormData.buddies.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        buddies: prev.buddies.filter((_, i) => i !== index),
      }));
    }
  };

  const addNextOfKin = () => {
    if (editFormData.nextOfKin.length < 3) {
      setEditFormData(prev => ({
        ...prev,
        nextOfKin: [...prev.nextOfKin, { name: '', phone: '', email: '' }],
      }));
    }
  };

  const removeNextOfKin = (index: number) => {
    if (editFormData.nextOfKin.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        nextOfKin: prev.nextOfKin.filter((_, i) => i !== index),
      }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading registrations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Back button pressed');
            try {
              router.back();
            } catch (error) {
              console.error('Router back error:', error);
              router.push('/admin-manage');
            }
          }} 
          style={styles.backButton}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin: Manage Registrations</Text>
        <View style={styles.backButton} />
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No registrations yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {registrations.length} Registration{registrations.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {registrations.map((reg) => {
            const isExpanded = expandedId === reg.id;
            const date = new Date(reg.createdAt).toLocaleDateString();

            return (
              <View key={reg.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(reg.id)}
                >
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.bloodGroupBadge}>
                      <Text style={styles.bloodGroupBadgeText}>
                        {reg.personalInfo.bloodGroup}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>{reg.personalInfo.registrantName}</Text>
                      <Text style={styles.cardDate}>{date}</Text>
                      <Text style={styles.cardSubtext}>
                        {reg.personalInfo.registrantPhone}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <TouchableOpacity
                      onPress={() => requestAction('edit', reg)}
                      style={[styles.adminButton, styles.editButton]}
                    >
                      <Ionicons name="pencil" size={16} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => requestAction('delete', reg)}
                      style={[styles.adminButton, styles.deleteButton]}
                    >
                      <Ionicons name="trash" size={16} color="#FFF" />
                    </TouchableOpacity>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.cardContent}>
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Personal Information</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Full Name:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.registrantName}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Apartment:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.registrantAptNumber}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date of Birth:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.dateOfBirth}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.registrantPhone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Blood Group:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.bloodGroup}</Text>
                      </View>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Buddies ({reg.buddies.length})</Text>
                      {reg.buddies.map((buddy, index) => (
                        <View key={index} style={styles.buddyCard}>
                          <Text style={styles.buddyTitle}>Buddy {index + 1}</Text>
                          <Text style={styles.buddyText}>{buddy.name}</Text>
                          <Text style={styles.buddyText}>{buddy.phone}</Text>
                          <Text style={styles.buddyText}>{buddy.email}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Next of Kin ({reg.nextOfKin.length})</Text>
                      {reg.nextOfKin.map((kin, index) => (
                        <View key={index} style={styles.buddyCard}>
                          <Text style={styles.buddyTitle}>Contact {index + 1}</Text>
                          <Text style={styles.buddyText}>{kin.name}</Text>
                          <Text style={styles.buddyText}>{kin.phone}</Text>
                          <Text style={styles.buddyText}>{kin.email}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Password Verification Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Admin Verification</Text>
            <Text style={styles.modalMessage}>
              Please enter your admin password to {pendingAction?.type} this registration:
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter admin password"
              placeholderTextColor="#999"
              secureTextEntry={true}
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPendingAction(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, verifying && styles.disabledButton]}
                onPress={handlePasswordSubmit}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal - This would be quite large, so showing simplified version */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.editModalContainer}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.editTitle}>Edit Registration</Text>
            <TouchableOpacity
              onPress={handleUpdateRegistration}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.editScrollView}>
            <Text style={styles.editSectionTitle}>Personal Information</Text>
            
            <TextInput
              style={styles.editInput}
              value={editFormData.personalInfo.registrantName}
              onChangeText={(value) => updatePersonalInfo('registrantName', value)}
              placeholder="Full Name"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.editInput}
              value={editFormData.personalInfo.registrantAptNumber}
              onChangeText={(value) => updatePersonalInfo('registrantAptNumber', value)}
              placeholder="Apartment Number"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.editInput}
              value={editFormData.personalInfo.dateOfBirth}
              onChangeText={(value) => updatePersonalInfo('dateOfBirth', value)}
              placeholder="Date of Birth (DD/MM/YYYY)"
              placeholderTextColor="#999"
            />
            
            {/* Add more form fields as needed - simplified for demo */}
            
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  countBadge: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E5F3FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bloodGroupBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  bloodGroupBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#999',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
  buddyCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buddyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  buddyText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  editScrollView: {
    flex: 1,
    padding: 16,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
});