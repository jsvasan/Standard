import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface PersonalInfo {
  registrantName: string;
  registrantPhone: string;
  registrantAptNumber: string;
  dateOfBirth: string;
  bloodGroup: string;
  insurancePolicy: string;
  insuranceCompany: string;
  doctorName: string;
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

export default function RegistrationsView() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        Alert.alert('Error', 'Failed to fetch registrations');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRegistrationText = (reg: Registration) => {
    const date = new Date(reg.createdAt).toLocaleDateString();
    
    // Calculate age
    let age = 'N/A';
    try {
      const dob = new Date(reg.personalInfo.dateOfBirth);
      const today = new Date();
      age = String(today.getFullYear() - dob.getFullYear() - 
        ((today.getMonth() < dob.getMonth() || 
         (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0));
    } catch (e) {}
    
    return `
╔════════════════════════════════════════╗
║     HEALTH REGISTRATION DETAILS        ║
╚════════════════════════════════════════╝

Registration Date: ${date}

───── REGISTRANT'S PERSONAL INFORMATION ─────
Full Name: ${reg.personalInfo.registrantName}
Apartment Number: ${reg.personalInfo.registrantAptNumber}
Date of Birth: ${reg.personalInfo.dateOfBirth} (Age: ${age} years)
Mobile Phone: ${reg.personalInfo.registrantPhone}
Blood Group: ${reg.personalInfo.bloodGroup}

───── MEDICAL INFORMATION ─────
Insurance Policy: ${reg.personalInfo.insurancePolicy}
Insurance Company: ${reg.personalInfo.insuranceCompany}
Doctor Name: ${reg.personalInfo.doctorName}
Hospital Name: ${reg.personalInfo.hospitalName}
Hospital Number: ${reg.personalInfo.hospitalNumber}
Current Ailments: ${reg.personalInfo.currentAilments}

━━━ BUDDIES ━━━
${reg.buddies.map((buddy, idx) => `
Buddy ${idx + 1}:
  Name: ${buddy.name}
  Phone: ${buddy.phone}
  Email: ${buddy.email}
  Apt Number: ${buddy.aptNumber}`).join('\n')}

━━━ NEXT OF KIN ━━━
${reg.nextOfKin.map((kin, idx) => `
Contact ${idx + 1}:
  Name: ${kin.name}
  Phone: ${kin.phone}
  Email: ${kin.email}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  };

  const formatAllRegistrationsText = () => {
    return `
╔════════════════════════════════════════╗
║   ALL HEALTH REGISTRATIONS EXPORT      ║
╚════════════════════════════════════════╝

Total Registrations: ${registrations.length}
Export Date: ${new Date().toLocaleDateString()}

${registrations.map((reg, idx) => `
${'='.repeat(44)}
REGISTRATION #${idx + 1}
${'='.repeat(44)}
${formatRegistrationText(reg)}`).join('\n')}
`;
  };

  const handleExportSingle = async (reg: Registration) => {
    try {
      const text = formatRegistrationText(reg);
      await Share.share({
        message: text,
        title: 'Health Registration Details',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleExportAll = async () => {
    if (registrations.length === 0) {
      Alert.alert('No Data', 'No registrations available to export');
      return;
    }

    try {
      const text = formatAllRegistrationsText();
      await Share.share({
        message: text,
        title: 'All Health Registrations',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrations</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/admin-manage')} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportAll} style={styles.exportAllButton}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No registrations yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.back()}
          >
            <Text style={styles.addButtonText}>Create First Registration</Text>
          </TouchableOpacity>
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
                      <Text style={styles.cardDate}>{date}</Text>
                      <Text style={styles.cardSubtext}>
                        {reg.personalInfo.registrantPhone}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <TouchableOpacity
                      onPress={() => handleExportSingle(reg)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="share-outline" size={20} color="#007AFF" />
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
                      <Text style={styles.infoSectionTitle}>Registrant's Personal Information</Text>
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
                        <Text style={styles.infoLabel}>Mobile Phone:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.registrantPhone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Blood Group:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.bloodGroup}</Text>
                      </View>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Medical Information</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Insurance Policy:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.insurancePolicy}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Insurance Company:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.insuranceCompany}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Doctor:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.doctorName}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hospital:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.hospitalName}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hospital Number:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.hospitalNumber}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Current Ailments:</Text>
                        <Text style={styles.infoValue}>{reg.personalInfo.currentAilments}</Text>
                      </View>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Buddies</Text>
                      {reg.buddies.map((buddy, idx) => (
                        <View key={idx} style={styles.subCard}>
                          <Text style={styles.subCardTitle}>Buddy {idx + 1}</Text>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>{buddy.name}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone:</Text>
                            <Text style={styles.infoValue}>{buddy.phone}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{buddy.email}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Apt Number:</Text>
                            <Text style={styles.infoValue}>{buddy.aptNumber}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Next of Kin</Text>
                      {reg.nextOfKin.map((kin, idx) => (
                        <View key={idx} style={styles.subCard}>
                          <Text style={styles.subCardTitle}>Contact {idx + 1}</Text>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>{kin.name}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone:</Text>
                            <Text style={styles.infoValue}>{kin.phone}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{kin.email}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  exportAllButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloodGroupBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  bloodGroupBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  iconButton: {
    padding: 4,
  },
  cardContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 140,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  subCard: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
