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
  const [emailPassword, setEmailPassword] = useState('');
  
  // Password verification for page access
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

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

  const handleVerifyPassword = async () => {
    if (!accessPassword) {
      if (Platform.OS === 'web') {
        alert('Please enter your password');
      } else {
        Alert.alert('Error', 'Please enter your password');
      }
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: accessPassword }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAccessPassword(''); // Clear password from memory
      } else {
        const error = await response.json();
        if (Platform.OS === 'web') {
          alert('Error: ' + (error.detail || 'Incorrect password'));
        } else {
          Alert.alert('Error', error.detail || 'Incorrect password');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (Platform.OS === 'web') {
        alert('Network error. Please check your connection.');
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAdditionalEmails = async () => {
    // Validate password is entered
    if (!emailPassword) {
      if (Platform.OS === 'web') {
        alert('Please enter your admin password to save changes.');
      } else {
        Alert.alert('Error', 'Please enter your admin password to save changes.');
      }
      return;
    }

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
        body: JSON.stringify({ additional_emails: validEmails, password: emailPassword }),
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

    // Verify password is entered
    if (!deletePassword) {
      if (Platform.OS === 'web') {
        alert('Please enter your admin password.');
      } else {
        Alert.alert('Error', 'Please enter your admin password.');
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
        body: JSON.stringify({ email: confirmEmail, password: deletePassword }),
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

  // Show password verification screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Management</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={64} color="#007AFF" />
          </View>
          
          <Text style={styles.verifyTitle}>Password Required</Text>
          <Text style={styles.verifyText}>
            Enter your admin password to access management settings
          </Text>

          <View style={styles.verifyForm}>
            <Text style={styles.label}>Admin Password *</Text>
            <TextInput
              style={styles.input}
              value={accessPassword}
              onChangeText={setAccessPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
              onPress={handleVerifyPassword}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.helpBox}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.helpText}>
              This is the password you set when registering as admin
            </Text>
          </View>
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
          {/* Copyright Header */}
          <Text style={styles.copyrightTop}>Copyright J Srinivasan</Text>
          
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

          <View style={styles.emailsCard}>
            <View style={styles.emailsHeader}>
              <Ionicons name="mail" size={24} color="#007AFF" />
              <Text style={styles.emailsTitle}>Additional Email Recipients</Text>
            </View>
            
            <Text style={styles.emailsDescription}>
              Add up to 2 additional email addresses to receive registration notifications
            </Text>

            {!editingEmails ? (
              <View>
                {additionalEmails && additionalEmails.length > 0 ? (
                  <View style={styles.currentEmailsList}>
                    {additionalEmails.map((email, index) => (
                      <View key={index} style={styles.emailItem}>
                        <Ionicons name="mail-outline" size={18} color="#007AFF" />
                        <Text style={styles.emailText}>{email}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noEmailsText}>No additional emails configured</Text>
                )}
                
                <TouchableOpacity
                  style={styles.editEmailsButton}
                  onPress={() => setEditingEmails(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                  <Text style={styles.editEmailsButtonText}>
                    {additionalEmails && additionalEmails.length > 0 ? 'Edit Emails' : 'Add Emails'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editEmailsSection}>
                {additionalEmails.map((email, index) => (
                  <View key={index} style={styles.emailInputRow}>
                    <TextInput
                      style={[styles.input, styles.emailInput]}
                      value={email}
                      onChangeText={(value) => updateEmailAtIndex(index, value)}
                      placeholder={`Email ${index + 1} (optional)`}
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {additionalEmails.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeEmailField(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {additionalEmails.length < 2 && (
                  <TouchableOpacity
                    style={styles.addEmailButton}
                    onPress={addEmailField}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                    <Text style={styles.addEmailButtonText}>Add Another Email</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.label}>Enter Your Password to Confirm *</Text>
                <TextInput
                  style={styles.input}
                  value={emailPassword}
                  onChangeText={setEmailPassword}
                  placeholder="Enter admin password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingEmails(false);
                      setEmailPassword('');
                      // Restore original emails
                      if (admin?.additional_emails) {
                        setAdditionalEmails(admin.additional_emails);
                      } else {
                        setAdditionalEmails([]);
                      }
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveEmailsButton, savingEmails && styles.saveEmailsButtonDisabled]}
                    onPress={handleSaveAdditionalEmails}
                    disabled={savingEmails}
                  >
                    {savingEmails ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.saveEmailsButtonText}>Save Emails</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.registrationManageCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="list" size={24} color="#007AFF" />
              <Text style={styles.cardTitle}>Registration Management</Text>
            </View>
            
            <Text style={styles.registrationManageDescription}>
              View, edit, and delete health registrations with admin privileges
            </Text>

            <TouchableOpacity
              style={styles.manageRegistrationsButton}
              onPress={() => router.push('/admin-registrations')}
            >
              <Ionicons name="settings" size={20} color="#007AFF" />
              <Text style={styles.manageRegistrationsButtonText}>Manage Registrations</Text>
              <Ionicons name="arrow-forward" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.excelDownloadCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color="#28A745" />
              <Text style={styles.cardTitle}>Excel Reports</Text>
            </View>
            
            <Text style={styles.excelDescription}>
              Download registration data as Excel files for record keeping and analysis
            </Text>

            <View style={styles.downloadButtonsContainer}>
              <TouchableOpacity
                style={[styles.downloadButton, styles.downloadAllButton]}
                onPress={() => handleDownloadAll()}
                disabled={downloadingAll}
              >
                {downloadingAll ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#FFF" />
                    <Text style={styles.downloadAllButtonText}>Download All</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.downloadButton, styles.downloadNewButton]}
                onPress={() => handleDownloadNew()}
                disabled={downloadingNew}
              >
                {downloadingNew ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color="#FFF" />
                    <Text style={styles.downloadNewButtonText}>New Only</Text>
                  </>
                )}
              </TouchableOpacity>
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
                To confirm deletion, please enter the admin email address and password:
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

              <Text style={styles.label}>Enter Admin Password *</Text>
              <TextInput
                style={styles.input}
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Enter admin password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                autoCapitalize="none"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setConfirmEmail('');
                    setDeletePassword('');
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

          {/* Bottom Copyright */}
          <Text style={styles.copyrightBottom}>Developed by JS with AI Coding App</Text>

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
  emailsCard: {
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
  emailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  emailsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  currentEmailsList: {
    marginBottom: 16,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#007AFF',
    flex: 1,
  },
  noEmailsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  editEmailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  editEmailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  editEmailsSection: {
    marginTop: 8,
  },
  emailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  emailInput: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 8,
  },
  addEmailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveEmailsButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveEmailsButtonDisabled: {
    backgroundColor: '#A0C4E8',
  },
  saveEmailsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  lockIcon: {
    marginBottom: 24,
  },
  verifyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  verifyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  verifyForm: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#A0C4E8',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginHorizontal: 24,
    gap: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  registrationManageCard: {
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
  registrationManageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  manageRegistrationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  manageRegistrationsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
  copyrightTop: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  copyrightBottom: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
