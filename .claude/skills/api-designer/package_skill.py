#!/usr/bin/env python3
"""
Package the API Designer skill into a distributable .skill file
"""

import os
import zipfile
import tempfile
import shutil
from pathlib import Path

def create_skill_package(skill_path: str, output_dir: str = ".") -> str:
    """
    Create a .skill package from the skill directory.

    Args:
        skill_path: Path to the skill directory
        output_dir: Directory to save the package

    Returns:
        Path to the created .skill file
    """
    skill_name = os.path.basename(skill_path.rstrip('/'))
    package_path = os.path.join(output_dir, f"{skill_name}.skill")

    # Validate skill structure
    required_files = ['SKILL.md']
    for file in required_files:
        if not os.path.exists(os.path.join(skill_path, file)):
            raise FileNotFoundError(f"Required file missing: {file}")

    # Create temporary directory for packaging
    with tempfile.TemporaryDirectory() as temp_dir:
        # Copy skill files to temp directory
        temp_skill_dir = os.path.join(temp_dir, skill_name)
        shutil.copytree(skill_path, temp_skill_dir)

        # Create zip file
        with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_skill_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arc_path)

    print(f"Skill package created: {package_path}")
    return package_path

def validate_skill(skill_path: str) -> list:
    """
    Validate the skill structure and content.

    Args:
        skill_path: Path to the skill directory

    Returns:
        List of validation errors (empty if valid)
    """
    errors = []

    # Check required files
    required_files = ['SKILL.md']
    for file in required_files:
        if not os.path.exists(os.path.join(skill_path, file)):
            errors.append(f"Required file missing: {file}")

    # Validate SKILL.md format
    skill_md_path = os.path.join(skill_path, 'SKILL.md')
    if os.path.exists(skill_md_path):
        with open(skill_md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for YAML frontmatter
        if not content.startswith('---'):
            errors.append("SKILL.md must start with YAML frontmatter")

        # Check for required frontmatter fields
        if 'name:' not in content.split('---')[1]:
            errors.append("SKILL.md must have 'name' in frontmatter")
        if 'description:' not in content.split('---')[1]:
            errors.append("SKILL.md must have 'description' in frontmatter")

    # Check optional directories
    optional_dirs = ['scripts', 'references', 'assets']
    for dir_name in optional_dirs:
        dir_path = os.path.join(skill_path, dir_name)
        if os.path.exists(dir_path) and not os.path.isdir(dir_path):
            errors.append(f"'{dir_name}' exists but is not a directory")

    return errors

def main():
    """Main function to validate and package the skill."""
    skill_path = os.path.dirname(os.path.abspath(__file__))

    print("Validating API Designer skill...")
    errors = validate_skill(skill_path)

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"  - {error}")
        return

    print("Validation passed!")

    try:
        package_path = create_skill_package(skill_path)
        print(f"✅ Skill successfully packaged: {package_path}")

        # Show package contents
        with zipfile.ZipFile(package_path, 'r') as zipf:
            print("\n📦 Package contents:")
            for file in zipf.namelist():
                print(f"  - {file}")

    except Exception as e:
        print(f"❌ Failed to create package: {e}")

if __name__ == "__main__":
    main()