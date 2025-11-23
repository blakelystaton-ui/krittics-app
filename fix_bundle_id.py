import plistlib
import re
import sys

# Update Info.plist
plist_path = 'ios/App/App/Info.plist'
try:
    with open(plist_path, 'rb') as f:
        plist = plistlib.load(f)
    plist[b'CFBundleIdentifier'] = b'com.blakely.krittics'
    with open(plist_path, 'wb') as f:
        plistlib.dump(plist, f)
    print("Updated Info.plist bundle ID to com.blakely.krittics")
except Exception as e:
    print(f"Info.plist update failed: {e}")

# Update project.pbxproj
pbx_path = 'ios/App/App.xcodeproj/project.pbxproj'
try:
    with open(pbx_path, 'r') as f:
        content = f.read()
    # Find and replace all instances of bundle ID
    content = re.sub(r'PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"([^"]*)";', r'PRODUCT_BUNDLE_IDENTIFIER = "com.blakely.krittics";', content)
    content = re.sub(r'CFBundleIdentifier"\s*=\s*"([^"]*)";', r'CFBundleIdentifier" = "com.blakely.krittics";', content)
    with open(pbx_path, 'w') as f:
        f.write(content)
    print("Updated project.pbxproj bundle ID to com.blakely.krittics")
except Exception as e:
    print(f"project.pbxproj update failed: {e}")
