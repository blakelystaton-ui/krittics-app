import re
import os

# --- Configuration for Krittics ---
PROJECT_FILE = 'ios/App/App.xcodeproj/project.pbxproj'
NEW_BUNDLE_ID = 'com.blakely.krittics'
PROFILE_SPECIFIER = 'Krittics App Store Profile'

def fix_pbxproj_signing():
    if not os.path.exists(PROJECT_FILE):
        print(f"Error: Xcode project file not found at {PROJECT_FILE}")
        return

    try:
        with open(PROJECT_FILE, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading project file: {e}")
        return

    print("Starting Xcode project file patching...")

    # 1. Update Bundle ID (PRODUCT_BUNDLE_IDENTIFIER)
    bundle_id_pattern = re.compile(r'(PRODUCT_BUNDLE_IDENTIFIER = )"(.*?)";')
    content = bundle_id_pattern.sub(f'\1"{NEW_BUNDLE_ID}";', content)
    print(f"-> Updated PRODUCT_BUNDLE_IDENTIFIER to {NEW_BUNDLE_ID}")

    # 2. Update Provisioning Profile Specifier (Fixes the App Store Profile error)
    pattern = re.compile(r'(\/\* Build configuration: Release \*\/.*?Settings = \{.*?)(\}\;)', re.DOTALL)
    
    def fix_release_block(match):
        block = match.group(1)
        
        if 'PROVISIONING_PROFILE_SPECIFIER' in block:
            block = re.sub(r'PROVISIONING_PROFILE_SPECIFIER = "(.*?)";', 
                           f'PROVISIONING_PROFILE_SPECIFIER = "{PROFILE_SPECIFIER}";', 
                           block)
        else:
            block = block.rstrip() + f'\n\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = "{PROFILE_SPECIFIER}";\n\t\t\t'
        
        return block + match.group(2)
        
    content = pattern.sub(fix_release_block, content)
    print(f"-> Enforced PROVISIONING_PROFILE_SPECIFIER to {PROFILE_SPECIFIER} for Release build.")

    # Save the modified content back to the project file
    with open(PROJECT_FILE, 'w') as f:
        f.write(content)
    
    print("Successfully patched Xcode project file. Ready for build.")

if __name__ == "__main__":
    fix_pbxproj_signing()

