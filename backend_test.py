#!/usr/bin/env python3
"""
Backend API Testing for Health Registration App
Tests all API endpoints with various validation scenarios
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://health-reg-app.preview.emergentagent.com/api"

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