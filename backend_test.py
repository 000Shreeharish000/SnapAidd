import requests
import sys
import json
from datetime import datetime

class SnapAidAPITester:
    def __init__(self, base_url="https://edge-emergency-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.police_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_emoji = "✅" if success else "❌"
        print(f"{status_emoji} {name}")
        if details:
            print(f"   Details: {details}")
        return success

    def run_request(self, method, endpoint, expected_status, data=None, headers=None):
        """Run HTTP request and return success status and response"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers, timeout=30)
            else:
                return False, {"error": "Unsupported method"}

            success = response.status_code == expected_status
            try:
                json_response = response.json()
            except:
                json_response = {"raw_text": response.text, "status_code": response.status_code}
            
            return success, json_response
            
        except Exception as e:
            return False, {"error": str(e), "exception_type": type(e).__name__}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        success, response = self.run_request('GET', '', 200)
        self.log_test("API Root Endpoint", success, 
                     f"Response: {response.get('message', 'No message')}")
        
        # Test health endpoint
        success, response = self.run_request('GET', 'health', 200)
        self.log_test("Health Check Endpoint", success, 
                     f"Status: {response.get('status', 'Unknown')}")

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test login with citizen account
        success, response = self.run_request('POST', 'auth/login', 200, {
            "email": "citizen@test.com",
            "password": "test123"
        })
        
        if success and 'token' in response:
            self.token = response['token']
            user_data = response.get('user', {})
            self.log_test("Citizen Login", True, 
                         f"Role: {user_data.get('role')}, Name: {user_data.get('name')}")
        else:
            self.log_test("Citizen Login", False, f"Response: {response}")
        
        # Test login with police account
        success, response = self.run_request('POST', 'auth/login', 200, {
            "email": "police@test.com",
            "password": "test123"
        })
        
        if success and 'token' in response:
            self.police_token = response['token']
            user_data = response.get('user', {})
            self.log_test("Police Login", True, 
                         f"Role: {user_data.get('role')}, Name: {user_data.get('name')}")
        else:
            self.log_test("Police Login", False, f"Response: {response}")
        
        # Test invalid credentials
        success, response = self.run_request('POST', 'auth/login', 401, {
            "email": "invalid@test.com",
            "password": "wrong"
        })
        self.log_test("Invalid Login Rejection", success, "Should return 401")

    def test_protected_endpoints(self):
        """Test protected endpoints with authentication"""
        print("\n🔍 Testing Protected Endpoints...")
        
        if not self.token:
            self.log_test("Protected Endpoints", False, "No valid token available")
            return
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Test /auth/me
        success, response = self.run_request('GET', 'auth/me', 200, headers=headers)
        if success:
            user_data = response
            self.log_test("Get Current User", True, 
                         f"Email: {user_data.get('email')}, Role: {user_data.get('role')}")
        else:
            self.log_test("Get Current User", False, f"Response: {response}")
        
        # Test profile endpoint
        success, response = self.run_request('GET', 'profile', 200, headers=headers)
        if success:
            self.log_test("Get Profile", True, f"Points: {response.get('points', 0)}")
        else:
            self.log_test("Get Profile", False, f"Response: {response}")

    def test_incident_flow(self):
        """Test incident creation and management flow"""
        print("\n🔍 Testing Incident Management...")
        
        if not self.token:
            self.log_test("Incident Flow", False, "No valid citizen token")
            return
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Test media analysis (should work even without Gemini key)
        media_data = {
            "media_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA",
            "media_type": "image/png"
        }
        success, response = self.run_request('POST', 'analyze-media', 200, media_data, headers)
        analysis_result = None
        if success:
            analysis_result = response
            self.log_test("Media Analysis", True, 
                         f"Type: {response.get('incident_type')}, Severity: {response.get('severity_score')}")
        else:
            self.log_test("Media Analysis", False, f"Response: {response}")
        
        # Test incident creation
        incident_data = {
            "incident_type": "Other",
            "severity_score": 3,
            "confidence_score": 0.8,
            "description": "Test incident for API testing",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "media_base64": media_data["media_base64"],
            "media_type": media_data["media_type"],
            "ai_summary": "Test incident summary"
        }
        
        success, response = self.run_request('POST', 'incidents', 201, incident_data, headers)
        incident_id = None
        if success:
            incident_id = response.get('incident_id')
            self.log_test("Create Incident", True, f"ID: {incident_id}")
        else:
            self.log_test("Create Incident", False, f"Response: {response}")
        
        # Test getting incidents (citizen view)
        success, response = self.run_request('GET', 'incidents', 200, headers=headers)
        if success and isinstance(response, list):
            self.log_test("Get Citizen Incidents", True, f"Found {len(response)} incidents")
        else:
            self.log_test("Get Citizen Incidents", False, f"Response: {response}")
        
        # Test police endpoints if we have police token
        if self.police_token and incident_id:
            self.test_police_operations(incident_id)

    def test_police_operations(self, incident_id):
        """Test police-specific operations"""
        print("\n🔍 Testing Police Operations...")
        
        if not self.police_token:
            self.log_test("Police Operations", False, "No valid police token")
            return
        
        headers = {'Authorization': f'Bearer {self.police_token}'}
        
        # Test getting all incidents (police view)
        success, response = self.run_request('GET', 'incidents', 200, headers=headers)
        if success and isinstance(response, list):
            self.log_test("Get All Incidents (Police)", True, f"Found {len(response)} total incidents")
        else:
            self.log_test("Get All Incidents (Police)", False, f"Response: {response}")
        
        # Test getting stats
        success, response = self.run_request('GET', 'stats', 200, headers=headers)
        if success:
            stats = response
            self.log_test("Get Police Stats", True, 
                         f"Total: {stats.get('total')}, Pending: {stats.get('pending')}")
        else:
            self.log_test("Get Police Stats", False, f"Response: {response}")
        
        # Test updating incident
        update_data = {
            "status": "dispatched",
            "internal_notes": "Test note from automated testing"
        }
        success, response = self.run_request('PATCH', f'incidents/{incident_id}', 200, update_data, headers)
        if success:
            self.log_test("Update Incident", True, f"Status: {response.get('status')}")
        else:
            self.log_test("Update Incident", False, f"Response: {response}")

    def test_citizen_restricted_access(self):
        """Test that citizens cannot access police-only endpoints"""
        print("\n🔍 Testing Access Controls...")
        
        if not self.token:
            self.log_test("Access Controls", False, "No citizen token available")
            return
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Citizens should NOT be able to access stats
        success, response = self.run_request('GET', 'stats', 403, headers=headers)
        self.log_test("Citizen Stats Access Denied", success, "Should return 403 Forbidden")

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Leaderboard should be accessible without authentication
        success, response = self.run_request('GET', 'leaderboard', 200)
        if success and isinstance(response, list):
            self.log_test("Get Leaderboard", True, f"Found {len(response)} users")
        else:
            self.log_test("Get Leaderboard", False, f"Response: {response}")

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting SnapAid API Testing...\n")
        print(f"Testing against: {self.base_url}")
        
        try:
            # Test suite
            self.test_health_endpoints()
            self.test_authentication()
            self.test_protected_endpoints()
            self.test_incident_flow()
            self.test_citizen_restricted_access()
            self.test_leaderboard()
            
        except Exception as e:
            self.log_test("Test Suite Execution", False, f"Critical error: {str(e)}")
        
        # Final results
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Save detailed results
        with open('/app/test_reports/backend_api_results.json', 'w') as f:
            json.dump({
                "summary": {
                    "total_tests": self.tests_run,
                    "passed_tests": self.tests_passed,
                    "success_rate": success_rate,
                    "timestamp": datetime.now().isoformat()
                },
                "tests": self.test_results
            }, f, indent=2)
        
        return self.tests_run > 0 and self.tests_passed >= (self.tests_run * 0.8)  # 80% pass rate

def main():
    tester = SnapAidAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())