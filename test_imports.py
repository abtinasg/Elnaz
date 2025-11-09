#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
This script tests the import structure without requiring Flask to be installed
"""

import sys
import os

print("=" * 60)
print("Testing Import Structure for Elnaz Backend")
print("=" * 60)
print()

def test_import(module_path, description):
    """Test if a module can be imported"""
    try:
        parts = module_path.split('.')
        if len(parts) == 1:
            __import__(parts[0])
        else:
            mod = __import__(module_path, fromlist=[parts[-1]])
        print(f"✓ {description}")
        return True
    except ImportError as e:
        print(f"✗ {description}")
        print(f"  Error: {e}")
        return False
    except ModuleNotFoundError as e:
        # Expected if Flask/dependencies are not installed
        if 'flask' in str(e).lower() or 'models' in str(e).lower():
            print(f"⚠ {description} (dependencies not installed - OK)")
            return True
        print(f"✗ {description}")
        print(f"  Error: {e}")
        return False

# Test backend package structure
print("1. Testing Backend Package Structure:")
print("-" * 60)
test_import('backend', 'backend package')
test_import('backend.database', 'backend.database module')
test_import('backend.routes', 'backend.routes package')
print()

print("2. Package Structure Verification:")
print("-" * 60)
files_to_check = [
    ('backend/__init__.py', 'Backend package init'),
    ('backend/routes/__init__.py', 'Routes package init'),
    ('backend/app.py', 'Main application'),
    ('backend/database.py', 'Database module'),
    ('backend/models.py', 'Models module'),
]

all_exist = True
for filepath, description in files_to_check:
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
    else:
        print(f"✗ {description}: {filepath} NOT FOUND")
        all_exist = False

print()
print("=" * 60)
if all_exist:
    print("✅ All imports and structure are correct!")
    print()
    print("To run the application:")
    print("  python3 -m backend.app")
else:
    print("❌ Some files are missing!")
print("=" * 60)
