import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function AdminManage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Additional emails state
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [editingEmails, setEditingEmails] = useState(false);
  const [savingEmails, setSavingEmails] = useState(false);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin`);
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
        // Load additional emails if they exist
        if (data.additional_emails) {
          setAdditionalEmails(data.additional_emails);
        }
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdditionalEmails = async () => {
    // Filter out empty emails
    const validEmails = additionalEmails.filter(email => email.trim() !== '');
    
    if (validEmails.length > 2) {
      if (Platform.OS === 'web') {
        alert('Maximum 2 additional emails allowed');
      } else {
        Alert.alert('Error', 'Maximum 2 additional emails allowed');
      }
      return;
    }

    setSavingEmails(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin/additional-emails`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additional_emails: validEmails }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('✅ Additional emails updated successfully!');
        } else {
          Alert.alert('Success', 'Additional emails updated successfully!');
        }
        setEditingEmails(false);
        await fetchAdmin(); // Refresh admin data
      } else {
        const error = await response.json();
        if (Platform.OS === 'web') {
          alert('Error: ' + (error.detail || 'Failed to update additional emails'));
        } else {
          Alert.alert('Error', error.detail || 'Failed to update additional emails');
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      if (Platform.OS === 'web') {
        alert('Network error. Please check your connection.');
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    } finally {
      setSavingEmails(false);
    }
  };

  const updateEmailAtIndex = (index: number, value: string) => {
    const newEmails = [...additionalEmails];
    newEmails[index] = value;
    setAdditionalEmails(newEmails);
  };

  const addEmailField = () => {
    if (additionalEmails.length < 2) {
      setAdditionalEmails([...additionalEmails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const handleDeleteAdmin = async () => {
    if (!admin) return;

    // Verify email matches
    if (confirmEmail.toLowerCase() !== admin.email.toLowerCase()) {
      if (Platform.OS === 'web') {
        alert('Email does not match. Please enter the correct admin email.');
      } else {
        Alert.alert('Error', 'Email does not match. Please enter the correct admin email.');
      }
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: confirmEmail }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('✅ Admin deleted successfully! You can now register a new admin.');
        } else {
          Alert.alert('Success', 'Admin deleted successfully!');
        }
        // Navigate to admin setup
        setTimeout(() => {
          router.replace('/admin-setup');
        }, 500);
      } else {
        const error = await response.json();
        if (Platform.OS === 'web') {
          alert('Error: ' + (error.detail || 'Failed to delete admin'));
        } else {
          Alert.alert('Error', error.detail || 'Failed to delete admin');
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (Platform.OS === 'web') {
        alert('Network error. Please check your connection.');
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>No Admin Found</Text>
          <Text style={styles.errorText}>
            No admin is currently registered. Please set up an admin first.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/admin-setup')}
          >
            <Text style={styles.primaryButtonText}>Setup Admin</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Management</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={40} color="#007AFF" />
              <Text style={styles.cardTitle}>Current Administrator</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{admin.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{admin.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{admin.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Registered:</Text>
              <Text style={styles.infoValue}>{formatDate(admin.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text style={styles.warningTitle}>Change Administrator</Text>
            </View>
            <Text style={styles.warningText}>
              To change the administrator, you must first delete the current admin. This action
              cannot be undone. You will be redirected to register a new admin after deletion.
            </Text>
          </View>

          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={styles.showDeleteButton}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.showDeleteButtonText}>Delete Current Admin</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteSection}>
              <View style={styles.deleteHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#FF3B30" />
                <Text style={styles.deleteTitle}>Confirm Admin Deletion</Text>
              </View>

              <Text style={styles.deleteInstruction}>
                To confirm deletion, please enter the admin email address:
              </Text>

              <Text style={styles.emailDisplay}>{admin.email}</Text>

              <Text style={styles.label}>Enter Admin Email to Confirm *</Text>
              <TextInput
                style={styles.input}
                value={confirmEmail}
                onChangeText={setConfirmEmail}
                placeholder="Enter admin email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setConfirmEmail('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
                  onPress={handleDeleteAdmin}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={18} color="#fff" />
                      <Text style={styles.deleteButtonText}>Delete Admin</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  showDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
    gap: 8,
  },
  showDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  deleteSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
    marginLeft: 8,
  },
  deleteInstruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FFA5A0',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
