import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    buddies: false,
    nextOfKin: false,
  });

  // Personal Info State
  const [registrantPhone, setRegistrantPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [insurancePolicy, setInsurancePolicy] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalNumber, setHospitalNumber] = useState('');
  const [currentAilments, setCurrentAilments] = useState('');

  // Buddies State (2 buddies)
  const [buddies, setBuddies] = useState([
    { name: '', phone: '', email: '', aptNumber: '' },
    { name: '', phone: '', email: '', aptNumber: '' },
  ]);

  // Next of Kin State (1-3 contacts)
  const [nextOfKin, setNextOfKin] = useState([
    { name: '', phone: '', email: '' },
  ]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateBuddy = (index: number, field: string, value: string) => {
    const newBuddies = [...buddies];
    newBuddies[index] = { ...newBuddies[index], [field]: value };
    setBuddies(newBuddies);
  };

  const updateNextOfKin = (index: number, field: string, value: string) => {
    const newNextOfKin = [...nextOfKin];
    newNextOfKin[index] = { ...newNextOfKin[index], [field]: value };
    setNextOfKin(newNextOfKin);
  };

  const addNextOfKin = () => {
    if (nextOfKin.length < 3) {
      setNextOfKin([...nextOfKin, { name: '', phone: '', email: '' }]);
    }
  };

  const removeNextOfKin = (index: number) => {
    if (nextOfKin.length > 1) {
      setNextOfKin(nextOfKin.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!registrantPhone) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    if (!bloodGroup) {
      Alert.alert('Validation Error', 'Please select a blood group');
      return false;
    }
    if (!insurancePolicy || !insuranceCompany) {
      Alert.alert('Validation Error', 'Please fill in insurance details');
      return false;
    }
    if (!doctorName || !hospitalName || !hospitalNumber) {
      Alert.alert('Validation Error', 'Please fill in doctor and hospital details');
      return false;
    }
    if (!currentAilments) {
      Alert.alert('Validation Error', 'Please describe current ailments');
      return false;
    }

    // Validate buddies
    for (let i = 0; i < buddies.length; i++) {
      const buddy = buddies[i];
      if (!buddy.name || !buddy.phone || !buddy.email || !buddy.aptNumber) {
        Alert.alert('Validation Error', `Please fill in all details for Buddy ${i + 1}`);
        return false;
      }
      if (!validateEmail(buddy.email)) {
        Alert.alert('Validation Error', `Invalid email for Buddy ${i + 1}`);
        return false;
      }
    }

    // Validate next of kin
    for (let i = 0; i < nextOfKin.length; i++) {
      const kin = nextOfKin[i];
      if (!kin.name || !kin.phone || !kin.email) {
        Alert.alert('Validation Error', `Please fill in all details for Next of Kin ${i + 1}`);
        return false;
      }
      if (!validateEmail(kin.email)) {
        Alert.alert('Validation Error', `Invalid email for Next of Kin ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registrationData = {
        personalInfo: {
          bloodGroup,
          insurancePolicy,
          insuranceCompany,
          doctorName,
          hospitalName,
          hospitalNumber,
          currentAilments,
        },
        buddies,
        nextOfKin,
      };

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Registration submitted successfully!',
          [
            {
              text: 'View Registrations',
              onPress: () => router.push('/registrations'),
            },
            {
              text: 'Submit Another',
              onPress: () => {
                // Reset form
                setBloodGroup('');
                setInsurancePolicy('');
                setInsuranceCompany('');
                setDoctorName('');
                setHospitalName('');
                setHospitalNumber('');
                setCurrentAilments('');
                setBuddies([
                  { name: '', phone: '', email: '', aptNumber: '' },
                  { name: '', phone: '', email: '', aptNumber: '' },
                ]);
                setNextOfKin([{ name: '', phone: '', email: '' }]);
              },
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to submit registration');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Registration</Text>
          <TouchableOpacity
            onPress={() => router.push('/registrations')}
            style={styles.viewButton}
          >
            <Ionicons name="list" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Info Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('personal')}
            >
              <Text style={styles.sectionTitle}>Personal Health Information</Text>
              <Ionicons
                name={expandedSections.personal ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {expandedSections.personal && (
              <View style={styles.sectionContent}>
                <Text style={styles.label}>Blood Group *</Text>
                <View style={styles.bloodGroupContainer}>
                  {BLOOD_GROUPS.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[
                        styles.bloodGroupButton,
                        bloodGroup === group && styles.bloodGroupButtonActive,
                      ]}
                      onPress={() => setBloodGroup(group)}
                    >
                      <Text
                        style={[
                          styles.bloodGroupText,
                          bloodGroup === group && styles.bloodGroupTextActive,
                        ]}
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Insurance Policy Number *</Text>
                <TextInput
                  style={styles.input}
                  value={insurancePolicy}
                  onChangeText={setInsurancePolicy}
                  placeholder="Enter policy number"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Insurance Company / EXHS Name *</Text>
                <TextInput
                  style={styles.input}
                  value={insuranceCompany}
                  onChangeText={setInsuranceCompany}
                  placeholder="Enter company name and address"
                  placeholderTextColor="#999"
                  multiline
                />

                <Text style={styles.label}>Doctor Name *</Text>
                <TextInput
                  style={styles.input}
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder="Name of doctor usually attending"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Hospital Name *</Text>
                <TextInput
                  style={styles.input}
                  value={hospitalName}
                  onChangeText={setHospitalName}
                  placeholder="Usual hospital visited"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Hospital Number *</Text>
                <TextInput
                  style={styles.input}
                  value={hospitalNumber}
                  onChangeText={setHospitalNumber}
                  placeholder="Hospital patient number"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Current Ailments *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={currentAilments}
                  onChangeText={setCurrentAilments}
                  placeholder="Describe current health conditions"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </View>

          {/* Buddies Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('buddies')}
            >
              <Text style={styles.sectionTitle}>Buddies Details (2 Required)</Text>
              <Ionicons
                name={expandedSections.buddies ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {expandedSections.buddies && (
              <View style={styles.sectionContent}>
                {buddies.map((buddy, index) => (
                  <View key={index} style={styles.buddyCard}>
                    <Text style={styles.buddyTitle}>Buddy {index + 1}</Text>

                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={buddy.name}
                      onChangeText={(value) => updateBuddy(index, 'name', value)}
                      placeholder="Enter name"
                      placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Phone *</Text>
                    <TextInput
                      style={styles.input}
                      value={buddy.phone}
                      onChangeText={(value) => updateBuddy(index, 'phone', value)}
                      placeholder="Enter phone number"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                      style={styles.input}
                      value={buddy.email}
                      onChangeText={(value) => updateBuddy(index, 'email', value)}
                      placeholder="Enter email"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Text style={styles.label}>Apartment Number *</Text>
                    <TextInput
                      style={styles.input}
                      value={buddy.aptNumber}
                      onChangeText={(value) => updateBuddy(index, 'aptNumber', value)}
                      placeholder="Enter apartment number"
                      placeholderTextColor="#999"
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Next of Kin Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('nextOfKin')}
            >
              <Text style={styles.sectionTitle}>Next of Kin (1-3 Contacts)</Text>
              <Ionicons
                name={expandedSections.nextOfKin ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {expandedSections.nextOfKin && (
              <View style={styles.sectionContent}>
                {nextOfKin.map((kin, index) => (
                  <View key={index} style={styles.buddyCard}>
                    <View style={styles.kinHeader}>
                      <Text style={styles.buddyTitle}>Contact {index + 1}</Text>
                      {nextOfKin.length > 1 && (
                        <TouchableOpacity onPress={() => removeNextOfKin(index)}>
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={kin.name}
                      onChangeText={(value) => updateNextOfKin(index, 'name', value)}
                      placeholder="Enter name"
                      placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Phone *</Text>
                    <TextInput
                      style={styles.input}
                      value={kin.phone}
                      onChangeText={(value) => updateNextOfKin(index, 'phone', value)}
                      placeholder="Enter phone number"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                      style={styles.input}
                      value={kin.email}
                      onChangeText={(value) => updateNextOfKin(index, 'email', value)}
                      placeholder="Enter email"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                ))}

                {nextOfKin.length < 3 && (
                  <TouchableOpacity style={styles.addButton} onPress={addNextOfKin}>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                    <Text style={styles.addButtonText}>Add Another Contact</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  keyboardView: {
    flex: 1,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  viewButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sectionContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  bloodGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  bloodGroupTextActive: {
    color: '#fff',
  },
  buddyCard: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buddyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  kinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
