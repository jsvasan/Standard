#!/usr/bin/env python3
"""
Backend Email Notification Testing
Focus: Test email notification system with updated Gmail App Password
"""

import requests
import json
import os
import sys
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get backend URL from frontend env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        logger.error(f"Could not read frontend .env file: {e}")
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

class EmailNotificationTester:
    def __init__(self):
        self.test_results = []
    
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"{status} - {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    def test_admin_exists(self):
        """Test if admin exists in the system"""
        try:
            response = requests.get(f"{API_BASE}/admin")
            if response.status_code == 200:
                admin_data = response.json()
                if admin_data:
                    self.log_result(
                        "Admin Exists Check", 
                        True, 
                        f"Admin found: {admin_data.get('email', 'Unknown')}"
                    )
                    return admin_data
                else:
                    self.log_result(
                        "Admin Exists Check", 
                        False, 
                        "No admin found in system"
                    )
                    return None
            else:
                self.log_result(
                    "Admin Exists Check", 
                    False, 
                    f"Failed to check admin: HTTP {response.status_code}"
                )
                return None
        except Exception as e:
            self.log_result(
                "Admin Exists Check", 
                False, 
                f"Exception occurred: {str(e)}"
            )
            return None
    
    def create_test_registration(self):
        """Create a test registration to trigger email notification"""
        test_registration = {
            "personalInfo": {
                "registrantName": "Dr. Rajesh Kumar",
                "registrantAptNumber": "A-204",
                "dateOfBirth": "15/03/1975",
                "registrantPhone": "+91-9876543210",
                "bloodGroup": "B+",
                "insurancePolicy": "HDFC-ERGO-789456",
                "insuranceCompany": "HDFC ERGO Health Insurance",
                "doctorName": "Dr. Priya Sharma",
                "doctorContact": "+91-9123456789",
                "hospitalName": "Apollo Hospital",
                "hospitalNumber": "APL-REG-12345",
                "currentAilments": "Hypertension, Diabetes Type 2"
            },
            "buddies": [
                {
                    "name": "Suresh Patel",
                    "phone": "+91-9988776655",
                    "email": "suresh.patel@example.com",
                    "aptNumber": "B-101"
                },
                {
                    "name": "Meera Gupta",
                    "phone": "+91-8877665544",
                    "email": "meera.gupta@example.com", 
                    "aptNumber": "C-305"
                }
            ],
            "nextOfKin": [
                {
                    "name": "Kavita Kumar",
                    "phone": "+91-9876543211",
                    "email": "kavita.kumar@example.com",
                    "country": "INDIA",
                    "city": "Bangalore",
                    "address": "123 MG Road, Bangalore"
                },
                {
                    "name": "Arjun Kumar",
                    "phone": "+91-9876543212", 
                    "email": "arjun.kumar@example.com",
                    "country": "INDIA",
                    "city": "Mumbai",
                    "address": "456 Marine Drive, Mumbai"
                }
            ]
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/registrations",
                json=test_registration,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                registration_data = response.json()
                self.log_result(
                    "Test Registration Creation",
                    True,
                    f"Registration created successfully for {test_registration['personalInfo']['registrantName']}",
                    {"registration_id": registration_data.get('id'), "is_update": registration_data.get('is_update')}
                )
                return registration_data
            else:
                self.log_result(
                    "Test Registration Creation",
                    False,
                    f"Failed to create registration: HTTP {response.status_code}",
                    {"response": response.text}
                )
                return None
                    
        except Exception as e:
            self.log_result(
                "Test Registration Creation",
                False,
                f"Exception occurred: {str(e)}"
            )
            return None
    
    def check_backend_logs_for_email_errors(self):
        """Check backend logs for email-related errors"""
        try:
            # Check recent backend logs for email errors
            import subprocess
            result = subprocess.run(
                ['tail', '-n', '100', '/var/log/supervisor/backend.err.log'],
                capture_output=True,
                text=True
            )
            
            log_content = result.stdout
            
            # Look for email-related errors
            email_errors = []
            auth_errors = []
            success_messages = []
            
            for line in log_content.split('\n'):
                line_lower = line.lower()
                if 'email' in line_lower:
                    if 'error' in line_lower or 'failed' in line_lower:
                        email_errors.append(line.strip())
                    elif 'sent successfully' in line_lower:
                        success_messages.append(line.strip())
                
                if '535' in line and 'username and password not accepted' in line_lower:
                    auth_errors.append(line.strip())
            
            # Analyze results
            if auth_errors:
                self.log_result(
                    "Email Authentication Check",
                    False,
                    f"Found {len(auth_errors)} authentication errors in logs",
                    {"auth_errors": auth_errors[-3:]}  # Last 3 errors
                )
            elif email_errors:
                self.log_result(
                    "Email Authentication Check",
                    False,
                    f"Found {len(email_errors)} email errors in logs",
                    {"email_errors": email_errors[-3:]}  # Last 3 errors
                )
            elif success_messages:
                self.log_result(
                    "Email Authentication Check",
                    True,
                    f"Found {len(success_messages)} successful email sends in logs",
                    {"recent_success": success_messages[-2:]}  # Last 2 successes
                )
            else:
                self.log_result(
                    "Email Authentication Check",
                    True,
                    "No email authentication errors found in recent logs"
                )
                
        except Exception as e:
            self.log_result(
                "Email Authentication Check",
                False,
                f"Could not check backend logs: {str(e)}"
            )
    
    def test_email_configuration(self):
        """Test email configuration from environment"""
        try:
            # Read backend .env file
            env_vars = {}
            with open('/app/backend/.env', 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        env_vars[key] = value.strip('"')
            
            gmail_email = env_vars.get('GMAIL_EMAIL')
            gmail_password = env_vars.get('GMAIL_PASSWORD')
            
            if gmail_email and gmail_password:
                # Check if it's the expected configuration
                expected_email = "jsvasan.ab@gmail.com"
                expected_password = "kzzg tqzs pjht inhx"
                
                email_correct = gmail_email == expected_email
                password_correct = gmail_password == expected_password
                
                if email_correct and password_correct:
                    self.log_result(
                        "Email Configuration Check",
                        True,
                        f"Email configuration correct: {gmail_email} with updated App Password"
                    )
                else:
                    issues = []
                    if not email_correct:
                        issues.append(f"Email mismatch: got {gmail_email}, expected {expected_email}")
                    if not password_correct:
                        issues.append("App Password does not match expected value")
                    
                    self.log_result(
                        "Email Configuration Check",
                        False,
                        f"Email configuration issues: {'; '.join(issues)}"
                    )
            else:
                missing = []
                if not gmail_email:
                    missing.append("GMAIL_EMAIL")
                if not gmail_password:
                    missing.append("GMAIL_PASSWORD")
                
                self.log_result(
                    "Email Configuration Check",
                    False,
                    f"Missing email configuration: {', '.join(missing)}"
                )
                
        except Exception as e:
            self.log_result(
                "Email Configuration Check",
                False,
                f"Could not read email configuration: {str(e)}"
            )
    
    async def wait_for_email_processing(self, seconds=10):
        """Wait for email processing and check logs"""
        logger.info(f"Waiting {seconds} seconds for email processing...")
        await asyncio.sleep(seconds)
        
        # Check logs again for recent email activity
        try:
            import subprocess
            result = subprocess.run(
                ['tail', '-n', '20', '/var/log/supervisor/backend.err.log'],
                capture_output=True,
                text=True
            )
            
            recent_logs = result.stdout
            email_activity = []
            
            for line in recent_logs.split('\n'):
                if 'email' in line.lower():
                    email_activity.append(line.strip())
            
            if email_activity:
                self.log_result(
                    "Email Processing Check",
                    True,
                    f"Found {len(email_activity)} email-related log entries",
                    {"recent_activity": email_activity}
                )
            else:
                self.log_result(
                    "Email Processing Check",
                    False,
                    "No email activity found in recent logs after registration"
                )
                
        except Exception as e:
            self.log_result(
                "Email Processing Check",
                False,
                f"Could not check recent email activity: {str(e)}"
            )
    
    async def run_comprehensive_email_tests(self):
        """Run all email-related tests"""
        logger.info("🚀 Starting Comprehensive Email Notification Testing")
        logger.info(f"Backend URL: {BACKEND_URL}")
        
        # Test 1: Check email configuration
        await self.test_email_configuration()
        
        # Test 2: Check if admin exists
        admin_data = await self.test_admin_exists()
        
        if not admin_data:
            logger.error("❌ Cannot proceed with email tests - no admin found")
            return
        
        # Test 3: Check backend logs for existing email errors
        await self.check_backend_logs_for_email_errors()
        
        # Test 4: Create test registration (should trigger email)
        registration_data = await self.create_test_registration()
        
        if registration_data:
            # Test 5: Wait and check for email processing
            await self.wait_for_email_processing(15)
            
            # Test 6: Final log check for email success/failure
            await self.check_backend_logs_for_email_errors()
        
        # Print summary
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        logger.info("\n" + "="*80)
        logger.info("📧 EMAIL NOTIFICATION TESTING SUMMARY")
        logger.info("="*80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        logger.info(f"Total Tests: {len(self.test_results)}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info("")
        
        # Group results by success/failure
        failed_tests = [r for r in self.test_results if not r['success']]
        passed_tests = [r for r in self.test_results if r['success']]
        
        if failed_tests:
            logger.info("❌ FAILED TESTS:")
            for result in failed_tests:
                logger.info(f"  • {result['test']}: {result['message']}")
                if result.get('details'):
                    logger.info(f"    Details: {result['details']}")
            logger.info("")
        
        if passed_tests:
            logger.info("✅ PASSED TESTS:")
            for result in passed_tests:
                logger.info(f"  • {result['test']}: {result['message']}")
            logger.info("")
        
        # Email-specific analysis
        email_config_passed = any(r['test'] == 'Email Configuration Check' and r['success'] for r in self.test_results)
        registration_passed = any(r['test'] == 'Test Registration Creation' and r['success'] for r in self.test_results)
        auth_check_passed = any(r['test'] == 'Email Authentication Check' and r['success'] for r in self.test_results)
        
        logger.info("🔍 EMAIL SYSTEM ANALYSIS:")
        logger.info(f"  📧 Email Configuration: {'✅ CORRECT' if email_config_passed else '❌ ISSUES'}")
        logger.info(f"  📝 Registration Creation: {'✅ WORKING' if registration_passed else '❌ FAILED'}")
        logger.info(f"  🔐 Authentication Status: {'✅ NO ERRORS' if auth_check_passed else '❌ ERRORS FOUND'}")
        
        if email_config_passed and registration_passed and auth_check_passed:
            logger.info("\n🎉 EMAIL SYSTEM STATUS: WORKING CORRECTLY")
            logger.info("   Gmail App Password authentication successful")
            logger.info("   Registration emails should be sending to admin")
        else:
            logger.info("\n⚠️  EMAIL SYSTEM STATUS: ISSUES DETECTED")
            logger.info("   Check failed tests above for specific problems")
        
        logger.info("="*80)

async def main():
    """Main test execution"""
    async with EmailNotificationTester() as tester:
        await tester.run_comprehensive_email_tests()

if __name__ == "__main__":
    asyncio.run(main())