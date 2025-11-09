#!/usr/bin/env python3
"""
Test script for Flask server
Tests server startup and basic endpoints
"""

import requests
import time
import subprocess
import sys
import signal

def test_server():
    """Test Flask server startup and endpoints"""

    print("="*60)
    print("🧪 Testing Flask Server")
    print("="*60)

    # Start server
    print("\n1. Starting Flask server...")
    server_process = subprocess.Popen(
        [sys.executable, '-m', 'backend.app'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Wait for server to start
    print("   Waiting for server to start...")
    time.sleep(5)

    base_url = "http://127.0.0.1:5000"
    tests_passed = 0
    tests_failed = 0

    try:
        # Test 1: Health check
        print("\n2. Testing /api/health endpoint...")
        try:
            response = requests.get(f"{base_url}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Health check passed: {data}")
                tests_passed += 1
            else:
                print(f"   ❌ Health check failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ Health check failed: {e}")
            tests_failed += 1

        # Test 2: SEO settings
        print("\n3. Testing /api/seo/settings endpoint...")
        try:
            response = requests.get(f"{base_url}/api/seo/settings", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ SEO settings endpoint working")
                tests_passed += 1
            else:
                print(f"   ❌ SEO settings failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ SEO settings failed: {e}")
            tests_failed += 1

        # Test 3: Shop products
        print("\n4. Testing /api/shop/products endpoint...")
        try:
            response = requests.get(f"{base_url}/api/shop/products", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Shop products endpoint working ({len(data.get('products', []))} products)")
                tests_passed += 1
            else:
                print(f"   ❌ Shop products failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ Shop products failed: {e}")
            tests_failed += 1

        # Test 4: Newsletter subscribe (POST)
        print("\n5. Testing /api/newsletter/subscribe endpoint...")
        try:
            test_email = f"test{int(time.time())}@example.com"
            response = requests.post(
                f"{base_url}/api/newsletter/subscribe",
                json={"email": test_email},
                timeout=5
            )
            if response.status_code in [200, 201]:
                print(f"   ✅ Newsletter subscribe working")
                tests_passed += 1
            else:
                print(f"   ❌ Newsletter subscribe failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ Newsletter subscribe failed: {e}")
            tests_failed += 1

        # Test 5: Contact form (POST)
        print("\n6. Testing /api/contact/submit endpoint...")
        try:
            response = requests.post(
                f"{base_url}/api/contact/submit",
                json={
                    "name": "Test User",
                    "email": "test@example.com",
                    "message": "This is a test message"
                },
                timeout=5
            )
            if response.status_code in [200, 201]:
                print(f"   ✅ Contact form working")
                tests_passed += 1
            else:
                print(f"   ❌ Contact form failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ Contact form failed: {e}")
            tests_failed += 1

        # Test 6: Static files
        print("\n7. Testing static file serving...")
        try:
            response = requests.get(f"{base_url}/", timeout=5)
            if response.status_code == 200 and 'html' in response.headers.get('content-type', '').lower():
                print(f"   ✅ Static files serving correctly")
                tests_passed += 1
            else:
                print(f"   ❌ Static files failed: {response.status_code}")
                tests_failed += 1
        except Exception as e:
            print(f"   ❌ Static files failed: {e}")
            tests_failed += 1

    finally:
        # Stop server
        print("\n8. Stopping server...")
        server_process.send_signal(signal.SIGTERM)
        server_process.wait(timeout=5)
        print("   ✅ Server stopped")

    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"✅ Tests Passed: {tests_passed}")
    print(f"❌ Tests Failed: {tests_failed}")
    print(f"📈 Success Rate: {(tests_passed/(tests_passed+tests_failed)*100):.1f}%")
    print("="*60)

    return tests_failed == 0

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1)
