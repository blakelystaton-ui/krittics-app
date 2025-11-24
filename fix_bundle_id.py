#!/usr/bin/env python3
"""
iOS Provisioning Profile Patcher
Patches the Xcode project file to use the correct provisioning profile.
Note: With the xcconfig solution in place, this script is a fallback safety measure.
"""

import re
import sys

XCODE_PROJECT_PATH = "ios/App/App.xcodeproj/project.pbxproj"
PROVISIONING_PROFILE = "Krittics App Store Profile"

def patch_provisioning_profile():
    """Patch the Xcode project file with the correct provisioning profile."""
    try:
        with open(XCODE_PROJECT_PATH, 'r') as f:
            content = f.read()
        
        # Pattern to find PROVISIONING_PROFILE_SPECIFIER lines
        pattern = r'PROVISIONING_PROFILE_SPECIFIER = "[^"]*";'
        replacement = f'PROVISIONING_PROFILE_SPECIFIER = "{PROVISIONING_PROFILE}";'
        
        # Count replacements
        new_content, count = re.subn(pattern, replacement, content)
        
        if count > 0:
            with open(XCODE_PROJECT_PATH, 'w') as f:
                f.write(new_content)
            print(f"✓ Patched {count} provisioning profile reference(s)")
            print(f"✓ Set to: {PROVISIONING_PROFILE}")
            return 0
        else:
            print("⚠ No provisioning profile references found to patch")
            print("ℹ This is expected if using xcconfig file (preferred method)")
            return 0
            
    except FileNotFoundError:
        print(f"✗ Error: {XCODE_PROJECT_PATH} not found")
        return 1
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(patch_provisioning_profile())
