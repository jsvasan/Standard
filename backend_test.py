#!/usr/bin/env python3
"""
Backend API Testing for Admin Registration Management
Tests the new PUT and DELETE endpoints for admin registration management
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://health-reg-app.preview.emergentagent.com/api"

def test_registration_submission_flow():
    """Test the complete registration submission flow with is_update field"""
    print("\n" + "="*70)
    print("TESTING REGISTRATION SUBMISSION API - FOCUS ON is_update FIELD")
    print("="*70)
    
    # Test data for new registration with realistic data
    new_registration_data = {
        "personalInfo": {
            "registrantName": "Dr. Amanda Rodriguez",
            "registrantAptNumber": "Tower-B 1205",
            "dateOfBirth": "22/08/1978",
            "registrantPhone": "+91-9876543210",
            "bloodGroup": "B+",
            "insurancePolicy": "HDFC-ERGO-789456123",
            "insuranceCompany": "HDFC ERGO Health Insurance",
            "doctorName": "Dr. Rajesh Kumar",
            "doctorContact": "+91-9123456789",
            "hospitalName": "Apollo Hospitals",
            "hospitalNumber": "APL-REG-456789",
            "currentAilments": "Mild hypertension, Vitamin D deficiency"
        },
        "buddies": [
            {
                "name": "Priya Sharma",
                "phone": "+91-9876543211",
                "email": "priya.sharma@gmail.com",
                "aptNumber": "Tower-A 804"
            },
            {
                "name": "Vikram Singh",
                "phone": "+91-9876543212",
                "email": "vikram.singh@outlook.com",
                "aptNumber": "Tower-C 1102"
            }
        ],
        "nextOfKin": [
            {
                "name": "Carlos Rodriguez",
                "phone": "+91-9876543213",
                "email": "carlos.rodriguez@yahoo.com"
            },
            {
                "name": "Maria Rodriguez",
                "phone": "+91-9876543214",
                "email": "maria.rodriguez@gmail.com"
            },
            {
                "name": "Sofia Rodriguez",
                "phone": "+91-9876543215",
                "email": "sofia.rodriguez@hotmail.com"
            }
        ]
    }
    
    # Test 1: Create NEW registration
    print("\n1. Testing NEW registration creation...")
    print(f"Phone number: {new_registration_data['personalInfo']['registrantPhone']}")
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", 
                               json=new_registration_data,
                               headers={"Content-Type": "application/json"},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ NEW registration created successfully")
            print(f"Registration ID: {data.get('id')}")
            print(f"Registrant Name: {data.get('personalInfo', {}).get('registrantName')}")
            print(f"Phone: {data.get('personalInfo', {}).get('registrantPhone')}")
            
            # CRITICAL CHECK: is_update field
            is_update = data.get('is_update')
            print(f"is_update field: {is_update}")
            
            if is_update is not None:
                if is_update == False:
                    print("✅ PASS: is_update correctly set to False for NEW registration")
                else:
                    print(f"❌ FAIL: is_update should be False for NEW registration, got: {is_update}")
                    return False
            else:
                print("❌ CRITICAL FAIL: is_update field MISSING from response")
                return False
            
            registration_id = data.get('id')
            
        else:
            print(f"❌ FAIL: Failed to create registration")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Exception during new registration: {e}")
        return False
    
    # Test 2: Update EXISTING registration (same phone number)
    print("\n2. Testing EXISTING registration update (same phone)...")
    
    # Modify some data for the update
    update_registration_data = new_registration_data.copy()
    update_registration_data["personalInfo"]["registrantName"] = "Dr. Amanda Rodriguez-Patel"
    update_registration_data["personalInfo"]["currentAilments"] = "Mild hypertension, Vitamin D deficiency, Recent knee injury"
    update_registration_data["personalInfo"]["doctorName"] = "Dr. Rajesh Kumar (Orthopedic Specialist)"
    update_registration_data["buddies"][0]["name"] = "Priya Sharma-Gupta"
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", 
                               json=update_registration_data,
                               headers={"Content-Type": "application/json"},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ EXISTING registration updated successfully")
            print(f"Registration ID: {data.get('id')}")
            print(f"Updated Name: {data.get('personalInfo', {}).get('registrantName')}")
            print(f"Phone: {data.get('personalInfo', {}).get('registrantPhone')}")
            
            # CRITICAL CHECK: is_update field
            is_update = data.get('is_update')
            print(f"is_update field: {is_update}")
            
            if is_update is not None:
                if is_update == True:
                    print("✅ PASS: is_update correctly set to True for EXISTING registration update")
                else:
                    print(f"❌ FAIL: is_update should be True for EXISTING registration update, got: {is_update}")
                    return False
            else:
                print("❌ CRITICAL FAIL: is_update field MISSING from response")
                return False
            
            # Verify the data was actually updated
            if data.get('personalInfo', {}).get('registrantName') == "Dr. Amanda Rodriguez-Patel":
                print("✅ PASS: Registration data successfully updated")
            else:
                print("❌ FAIL: Registration data was not updated properly")
                return False
                
        else:
            print(f"❌ FAIL: Failed to update registration")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Exception during registration update: {e}")
        return False
    
    # Test 3: Create NEW registration with different phone number
    print("\n3. Testing NEW registration with different phone number...")
    
    different_phone_data = new_registration_data.copy()
    different_phone_data["personalInfo"]["registrantPhone"] = "+91-8765432109"
    different_phone_data["personalInfo"]["registrantName"] = "Mr. Arjun Mehta"
    different_phone_data["personalInfo"]["bloodGroup"] = "A+"
    different_phone_data["buddies"][0]["name"] = "Neha Agarwal"
    different_phone_data["buddies"][1]["name"] = "Rohit Verma"
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", 
                               json=different_phone_data,
                               headers={"Content-Type": "application/json"},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ NEW registration with different phone created successfully")
            print(f"Registration ID: {data.get('id')}")
            print(f"Name: {data.get('personalInfo', {}).get('registrantName')}")
            print(f"Phone: {data.get('personalInfo', {}).get('registrantPhone')}")
            
            # CRITICAL CHECK: is_update field
            is_update = data.get('is_update')
            print(f"is_update field: {is_update}")
            
            if is_update is not None:
                if is_update == False:
                    print("✅ PASS: is_update correctly set to False for NEW registration with different phone")
                else:
                    print(f"❌ FAIL: is_update should be False for NEW registration, got: {is_update}")
                    return False
            else:
                print("❌ CRITICAL FAIL: is_update field MISSING from response")
                return False
                
        else:
            print(f"❌ FAIL: Failed to create registration with different phone")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Exception during different phone registration: {e}")
        return False
    
    print("\n✅ ALL REGISTRATION SUBMISSION TESTS PASSED")
    return True

def test_create_valid_registration():
    """Test creating a valid registration with 2 buddies and 2 next of kin"""
    print("\n=== Testing: Create Valid Registration ===")
    
    payload = {
        "personalInfo": {
            "bloodGroup": "O+",
            "insurancePolicy": "POL123456",
            "insuranceCompany": "HealthFirst Insurance",
            "doctorName": "Dr. Sarah Johnson",
            "hospitalName": "City General Hospital",
            "hospitalNumber": "+1-555-0123",
            "currentAilments": "Hypertension, Diabetes Type 2"
        },
        "buddies": [
            {
                "name": "John Smith",
                "phone": "+1-555-0101",
                "email": "john.smith@email.com",
                "aptNumber": "Apt 4B"
            },
            {
                "name": "Emily Davis",
                "phone": "+1-555-0102", 
                "email": "emily.davis@email.com",
                "aptNumber": "Unit 12A"
            }
        ],
        "nextOfKin": [
            {
                "name": "Michael Johnson",
                "phone": "+1-555-0201",
                "email": "michael.johnson@email.com"
            },
            {
                "name": "Lisa Wilson",
                "phone": "+1-555-0202",
                "email": "lisa.wilson@email.com"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS: Valid registration created")
            print(f"Registration ID: {data.get('id', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ FAILED: Expected 200/201, got {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")
        return None

def test_create_registration_with_one_buddy():
    """Test creating registration with only 1 buddy (should fail)"""
    print("\n=== Testing: Create Registration with 1 Buddy (Should Fail) ===")
    
    payload = {
        "personalInfo": {
            "bloodGroup": "A+",
            "insurancePolicy": "POL789012",
            "insuranceCompany": "MediCare Plus",
            "doctorName": "Dr. Robert Chen",
            "hospitalName": "Metro Medical Center",
            "hospitalNumber": "+1-555-0456",
            "currentAilments": "None"
        },
        "buddies": [
            {
                "name": "Alice Brown",
                "phone": "+1-555-0301",
                "email": "alice.brown@email.com",
                "aptNumber": "Suite 5C"
            }
        ],
        "nextOfKin": [
            {
                "name": "David Brown",
                "phone": "+1-555-0401",
                "email": "david.brown@email.com"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ SUCCESS: Correctly rejected registration with 1 buddy")
            print(f"Error message: {response.json().get('detail', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_create_registration_with_zero_next_of_kin():
    """Test creating registration with 0 next of kin (should fail)"""
    print("\n=== Testing: Create Registration with 0 Next of Kin (Should Fail) ===")
    
    payload = {
        "personalInfo": {
            "bloodGroup": "B-",
            "insurancePolicy": "POL345678",
            "insuranceCompany": "Universal Health",
            "doctorName": "Dr. Maria Garcia",
            "hospitalName": "Regional Health Center",
            "hospitalNumber": "+1-555-0789",
            "currentAilments": "Asthma"
        },
        "buddies": [
            {
                "name": "Tom Wilson",
                "phone": "+1-555-0501",
                "email": "tom.wilson@email.com",
                "aptNumber": "Floor 3"
            },
            {
                "name": "Sarah Miller",
                "phone": "+1-555-0502",
                "email": "sarah.miller@email.com",
                "aptNumber": "Room 201"
            }
        ],
        "nextOfKin": []
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ SUCCESS: Correctly rejected registration with 0 next of kin")
            print(f"Error message: {response.json().get('detail', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_create_registration_with_four_next_of_kin():
    """Test creating registration with 4 next of kin (should fail)"""
    print("\n=== Testing: Create Registration with 4 Next of Kin (Should Fail) ===")
    
    payload = {
        "personalInfo": {
            "bloodGroup": "AB+",
            "insurancePolicy": "POL901234",
            "insuranceCompany": "Premier Health",
            "doctorName": "Dr. James Lee",
            "hospitalName": "Downtown Medical",
            "hospitalNumber": "+1-555-0987",
            "currentAilments": "High cholesterol"
        },
        "buddies": [
            {
                "name": "Chris Taylor",
                "phone": "+1-555-0601",
                "email": "chris.taylor@email.com",
                "aptNumber": "Building A"
            },
            {
                "name": "Jessica Moore",
                "phone": "+1-555-0602",
                "email": "jessica.moore@email.com",
                "aptNumber": "Building B"
            }
        ],
        "nextOfKin": [
            {
                "name": "Robert Taylor",
                "phone": "+1-555-0701",
                "email": "robert.taylor@email.com"
            },
            {
                "name": "Nancy Taylor",
                "phone": "+1-555-0702",
                "email": "nancy.taylor@email.com"
            },
            {
                "name": "Mark Taylor",
                "phone": "+1-555-0703",
                "email": "mark.taylor@email.com"
            },
            {
                "name": "Linda Taylor",
                "phone": "+1-555-0704",
                "email": "linda.taylor@email.com"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ SUCCESS: Correctly rejected registration with 4 next of kin")
            print(f"Error message: {response.json().get('detail', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_create_registration_with_invalid_email():
    """Test creating registration with invalid email format (should fail)"""
    print("\n=== Testing: Create Registration with Invalid Email (Should Fail) ===")
    
    payload = {
        "personalInfo": {
            "bloodGroup": "O-",
            "insurancePolicy": "POL567890",
            "insuranceCompany": "HealthGuard",
            "doctorName": "Dr. Amanda White",
            "hospitalName": "Northside Hospital",
            "hospitalNumber": "+1-555-0321",
            "currentAilments": "Allergies"
        },
        "buddies": [
            {
                "name": "Kevin Jones",
                "phone": "+1-555-0801",
                "email": "invalid-email-format",  # Invalid email
                "aptNumber": "Apt 7D"
            },
            {
                "name": "Rachel Green",
                "phone": "+1-555-0802",
                "email": "rachel.green@email.com",
                "aptNumber": "Apt 8E"
            }
        ],
        "nextOfKin": [
            {
                "name": "Paul Jones",
                "phone": "+1-555-0901",
                "email": "paul.jones@email.com"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/registrations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422 or response.status_code == 400:
            print("✅ SUCCESS: Correctly rejected registration with invalid email")
            print(f"Response: {response.text}")
        else:
            print(f"❌ FAILED: Expected 422/400, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_get_all_registrations():
    """Test fetching all registrations"""
    print("\n=== Testing: Get All Registrations ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/registrations", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Retrieved {len(data)} registrations")
            if len(data) > 0:
                print(f"Sample registration ID: {data[0].get('id', 'N/A')}")
            return data
        else:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")
        return []

def test_get_registration_by_valid_id(registration_id):
    """Test fetching single registration by valid ID"""
    print(f"\n=== Testing: Get Registration by Valid ID ({registration_id}) ===")
    
    if not registration_id:
        print("⚠️ SKIPPED: No valid registration ID available")
        return
    
    try:
        response = requests.get(f"{BACKEND_URL}/registrations/{registration_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS: Retrieved registration by ID")
            print(f"Registration ID: {data.get('id', 'N/A')}")
            print(f"Blood Group: {data.get('personalInfo', {}).get('bloodGroup', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_get_registration_by_invalid_id():
    """Test fetching registration with invalid ID format"""
    print("\n=== Testing: Get Registration by Invalid ID (Should Fail) ===")
    
    invalid_id = "invalid-id-format"
    
    try:
        response = requests.get(f"{BACKEND_URL}/registrations/{invalid_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ SUCCESS: Correctly rejected invalid ID format")
            print(f"Error message: {response.json().get('detail', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def test_get_registration_by_nonexistent_id():
    """Test fetching registration with valid format but non-existent ID"""
    print("\n=== Testing: Get Registration by Non-existent ID (Should Fail) ===")
    
    # Valid ObjectId format but doesn't exist
    nonexistent_id = "507f1f77bcf86cd799439011"
    
    try:
        response = requests.get(f"{BACKEND_URL}/registrations/{nonexistent_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ SUCCESS: Correctly returned 404 for non-existent registration")
            print(f"Error message: {response.json().get('detail', 'N/A')}")
        else:
            print(f"❌ FAILED: Expected 404, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

def main():
    """Run all backend API tests"""
    print("🚀 Starting Backend API Tests for Health Registration App")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    # Test 1: Create valid registration
    registration_id = test_create_valid_registration()
    
    # Test 2: Try to create registration with 1 buddy (should fail)
    test_create_registration_with_one_buddy()
    
    # Test 3: Try to create registration with 0 next of kin (should fail)
    test_create_registration_with_zero_next_of_kin()
    
    # Test 4: Try to create registration with 4 next of kin (should fail)
    test_create_registration_with_four_next_of_kin()
    
    # Test 5: Create registration with invalid email format (should fail)
    test_create_registration_with_invalid_email()
    
    # Test 6: Fetch all registrations
    all_registrations = test_get_all_registrations()
    
    # Test 7: Fetch single registration by valid ID
    test_get_registration_by_valid_id(registration_id)
    
    # Test 8: Try to fetch registration with invalid ID format
    test_get_registration_by_invalid_id()
    
    # Test 9: Try to fetch registration with non-existent ID
    test_get_registration_by_nonexistent_id()
    
    print("\n" + "=" * 60)
    print("🏁 Backend API Testing Complete")

if __name__ == "__main__":
    main()