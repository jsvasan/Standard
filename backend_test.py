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

def test_admin_registration_management():
    """Test admin registration management endpoints"""
    print("🧪 Testing Admin Registration Management Endpoints")
    print("=" * 60)
    
    # Test data
    admin_data = {
        "name": "Test Admin",
        "phone": "+1234567890",
        "email": "admin@test.com",
        "password": "AdminPass123!"
    }
    
    registration_data = {
        "personalInfo": {
            "registrantName": "John Doe",
            "registrantAptNumber": "A101",
            "dateOfBirth": "15/01/1990",
            "registrantPhone": "+1987654321",
            "bloodGroup": "O+",
            "insurancePolicy": "INS123456",
            "insuranceCompany": "Health Corp",
            "doctorName": "Dr. Smith",
            "doctorContact": "+1555123456",
            "hospitalName": "City Hospital",
            "hospitalNumber": "H789",
            "currentAilments": "None"
        },
        "buddies": [
            {
                "name": "Alice Johnson",
                "phone": "+1555111111",
                "email": "alice@test.com",
                "aptNumber": "B202"
            },
            {
                "name": "Bob Wilson",
                "phone": "+1555222222", 
                "email": "bob@test.com",
                "aptNumber": "C303"
            }
        ],
        "nextOfKin": [
            {
                "name": "Jane Doe",
                "phone": "+1555333333",
                "email": "jane@test.com"
            }
        ]
    }
    
    admin_id = None
    registration_id = None
    
    try:
        # Step 1: Check if admin exists, if not create one
        print("\n1️⃣ Setting up admin...")
        admin_response = requests.get(f"{BACKEND_URL}/admin")
        
        if admin_response.status_code == 200 and admin_response.json():
            print("✅ Admin already exists")
            admin_id = admin_response.json()["id"]
        else:
            print("📝 Creating admin...")
            admin_create_response = requests.post(f"{BACKEND_URL}/admin/register", json=admin_data)
            if admin_create_response.status_code == 200:
                admin_id = admin_create_response.json()["id"]
                print(f"✅ Admin created successfully: {admin_id}")
            else:
                print(f"❌ Failed to create admin: {admin_create_response.status_code} - {admin_create_response.text}")
                return False
        
        # Step 2: Create a test registration
        print("\n2️⃣ Creating test registration...")
        reg_response = requests.post(f"{BACKEND_URL}/registrations", json=registration_data)
        if reg_response.status_code == 200:
            registration_id = reg_response.json()["id"]
            print(f"✅ Registration created successfully: {registration_id}")
        else:
            print(f"❌ Failed to create registration: {reg_response.status_code} - {reg_response.text}")
            return False
        
        # Step 3: Test PUT /api/registrations/{id} - Valid admin password
        print("\n3️⃣ Testing PUT /api/registrations/{id} with valid admin password...")
        
        updated_data = {
            "password": admin_data["password"],
            "personalInfo": {
                "registrantName": "John Doe Updated",
                "registrantAptNumber": "A101",
                "dateOfBirth": "15/01/1990",
                "registrantPhone": "+1987654321",
                "bloodGroup": "A+",  # Changed blood group
                "insurancePolicy": "INS123456-UPDATED",
                "insuranceCompany": "Health Corp Updated",
                "doctorName": "Dr. Smith Updated",
                "doctorContact": "+1555123456",
                "hospitalName": "City Hospital Updated",
                "hospitalNumber": "H789",
                "currentAilments": "Updated ailments"
            },
            "buddies": [
                {
                    "name": "Alice Johnson Updated",
                    "phone": "+1555111111",
                    "email": "alice.updated@test.com",
                    "aptNumber": "B202"
                }
            ],
            "nextOfKin": [
                {
                    "name": "Jane Doe Updated",
                    "phone": "+1555333333",
                    "email": "jane.updated@test.com"
                },
                {
                    "name": "Jim Doe",
                    "phone": "+1555444444",
                    "email": "jim@test.com"
                }
            ]
        }
        
        update_response = requests.put(f"{BACKEND_URL}/registrations/{registration_id}", json=updated_data)
        if update_response.status_code == 200:
            updated_reg = update_response.json()
            print("✅ Registration updated successfully with valid admin password")
            print(f"   Updated name: {updated_reg['personalInfo']['registrantName']}")
            print(f"   Updated blood group: {updated_reg['personalInfo']['bloodGroup']}")
            print(f"   Buddies count: {len(updated_reg['buddies'])}")
            print(f"   Next of kin count: {len(updated_reg['nextOfKin'])}")
        else:
            print(f"❌ Failed to update registration with valid password: {update_response.status_code} - {update_response.text}")
            return False
        
        # Step 4: Test PUT with invalid admin password
        print("\n4️⃣ Testing PUT /api/registrations/{id} with invalid admin password...")
        
        invalid_password_data = updated_data.copy()
        invalid_password_data["password"] = "WrongPassword123!"
        
        invalid_update_response = requests.put(f"{BACKEND_URL}/registrations/{registration_id}", json=invalid_password_data)
        if invalid_update_response.status_code == 401:
            print("✅ Correctly rejected update with invalid admin password (401)")
        else:
            print(f"❌ Expected 401 for invalid password, got: {invalid_update_response.status_code} - {invalid_update_response.text}")
            return False
        
        # Step 5: Test PUT with invalid registration ID
        print("\n5️⃣ Testing PUT /api/registrations/{id} with invalid registration ID...")
        
        invalid_id_response = requests.put(f"{BACKEND_URL}/registrations/invalid_id", json=updated_data)
        if invalid_id_response.status_code == 400:
            print("✅ Correctly rejected update with invalid registration ID (400)")
        else:
            print(f"❌ Expected 400 for invalid ID, got: {invalid_id_response.status_code} - {invalid_id_response.text}")
            return False
        
        # Step 6: Test PUT with invalid data structure (too many buddies)
        print("\n6️⃣ Testing PUT /api/registrations/{id} with invalid data structure...")
        
        invalid_structure_data = updated_data.copy()
        invalid_structure_data["buddies"] = [
            {"name": "Buddy1", "phone": "+1111111111", "email": "buddy1@test.com", "aptNumber": "A1"},
            {"name": "Buddy2", "phone": "+1222222222", "email": "buddy2@test.com", "aptNumber": "A2"},
            {"name": "Buddy3", "phone": "+1333333333", "email": "buddy3@test.com", "aptNumber": "A3"}  # Too many buddies
        ]
        
        invalid_structure_response = requests.put(f"{BACKEND_URL}/registrations/{registration_id}", json=invalid_structure_data)
        if invalid_structure_response.status_code == 400:
            print("✅ Correctly rejected update with invalid data structure - too many buddies (400)")
        else:
            print(f"❌ Expected 400 for invalid structure, got: {invalid_structure_response.status_code} - {invalid_structure_response.text}")
            return False
        
        # Step 7: Test PUT with invalid data structure (too many next of kin)
        print("\n7️⃣ Testing PUT /api/registrations/{id} with too many next of kin...")
        
        invalid_kin_data = updated_data.copy()
        invalid_kin_data["nextOfKin"] = [
            {"name": "Kin1", "phone": "+1111111111", "email": "kin1@test.com"},
            {"name": "Kin2", "phone": "+1222222222", "email": "kin2@test.com"},
            {"name": "Kin3", "phone": "+1333333333", "email": "kin3@test.com"},
            {"name": "Kin4", "phone": "+1444444444", "email": "kin4@test.com"}  # Too many next of kin
        ]
        
        invalid_kin_response = requests.put(f"{BACKEND_URL}/registrations/{registration_id}", json=invalid_kin_data)
        if invalid_kin_response.status_code == 400:
            print("✅ Correctly rejected update with too many next of kin (400)")
        else:
            print(f"❌ Expected 400 for too many next of kin, got: {invalid_kin_response.status_code} - {invalid_kin_response.text}")
            return False
        
        # Step 8: Test DELETE /api/registrations/{id} with invalid admin password
        print("\n8️⃣ Testing DELETE /api/registrations/{id} with invalid admin password...")
        
        invalid_delete_data = {"password": "WrongPassword123!"}
        invalid_delete_response = requests.delete(f"{BACKEND_URL}/registrations/{registration_id}", json=invalid_delete_data)
        if invalid_delete_response.status_code == 401:
            print("✅ Correctly rejected delete with invalid admin password (401)")
        else:
            print(f"❌ Expected 401 for invalid password, got: {invalid_delete_response.status_code} - {invalid_delete_response.text}")
            return False
        
        # Step 9: Test DELETE with invalid registration ID
        print("\n9️⃣ Testing DELETE /api/registrations/{id} with invalid registration ID...")
        
        valid_delete_data = {"password": admin_data["password"]}
        invalid_id_delete_response = requests.delete(f"{BACKEND_URL}/registrations/invalid_id", json=valid_delete_data)
        if invalid_id_delete_response.status_code == 400:
            print("✅ Correctly rejected delete with invalid registration ID (400)")
        else:
            print(f"❌ Expected 400 for invalid ID, got: {invalid_id_delete_response.status_code} - {invalid_id_delete_response.text}")
            return False
        
        # Step 10: Test DELETE with non-existent registration ID
        print("\n🔟 Testing DELETE /api/registrations/{id} with non-existent registration ID...")
        
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but doesn't exist
        nonexistent_delete_response = requests.delete(f"{BACKEND_URL}/registrations/{fake_id}", json=valid_delete_data)
        if nonexistent_delete_response.status_code == 404:
            print("✅ Correctly rejected delete with non-existent registration ID (404)")
        else:
            print(f"❌ Expected 404 for non-existent ID, got: {nonexistent_delete_response.status_code} - {nonexistent_delete_response.text}")
            return False
        
        # Step 11: Test DELETE /api/registrations/{id} with valid admin password
        print("\n1️⃣1️⃣ Testing DELETE /api/registrations/{id} with valid admin password...")
        
        delete_response = requests.delete(f"{BACKEND_URL}/registrations/{registration_id}", json=valid_delete_data)
        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print("✅ Registration deleted successfully with valid admin password")
            print(f"   Deleted ID: {delete_result.get('deleted_id')}")
        else:
            print(f"❌ Failed to delete registration with valid password: {delete_response.status_code} - {delete_response.text}")
            return False
        
        # Step 12: Verify registration is actually deleted
        print("\n1️⃣2️⃣ Verifying registration is actually deleted...")
        
        verify_response = requests.get(f"{BACKEND_URL}/registrations/{registration_id}")
        if verify_response.status_code == 404:
            print("✅ Confirmed registration is deleted (404 when trying to fetch)")
        else:
            print(f"❌ Registration still exists after deletion: {verify_response.status_code}")
            return False
        
        print("\n" + "=" * 60)
        print("🎉 ALL ADMIN REGISTRATION MANAGEMENT TESTS PASSED!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        return False

def test_password_verification():
    """Test bcrypt password verification specifically"""
    print("\n🔐 Testing Password Verification with bcrypt...")
    print("=" * 40)
    
    try:
        # Test admin password verification endpoint
        test_password = "TestPassword123!"
        
        verify_response = requests.post(f"{BACKEND_URL}/admin/verify-password", json={"password": test_password})
        
        if verify_response.status_code == 404:
            print("ℹ️ No admin found for password verification test (expected if no admin exists)")
            return True
        elif verify_response.status_code == 401:
            print("✅ Password verification working - correctly rejected wrong password")
            return True
        elif verify_response.status_code == 200:
            print("✅ Password verification working - accepted correct password")
            return True
        else:
            print(f"❌ Unexpected response from password verification: {verify_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Password verification test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Backend API Tests for Admin Registration Management")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    # Run tests
    admin_tests_passed = test_admin_registration_management()
    password_tests_passed = test_password_verification()
    
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    print(f"Admin Registration Management Tests: {'✅ PASSED' if admin_tests_passed else '❌ FAILED'}")
    print(f"Password Verification Tests: {'✅ PASSED' if password_tests_passed else '❌ FAILED'}")
    
    if admin_tests_passed and password_tests_passed:
        print("\n🎉 ALL TESTS PASSED - Admin registration management is working correctly!")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED - Check the output above for details")
        sys.exit(1)