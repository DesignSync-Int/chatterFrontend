# Version Management

This document explains how to manage application versions for the Chatter app.

## Current Version System

The application uses semantic versioning (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Breaking changes that require user intervention
- **MINOR**: New features or significant updates (recommended for each deployment)
- **PATCH**: Bug fixes and small improvements

## How It Works

The application version is automatically displayed in the footer by importing the version from `package.json`. This ensures the displayed version is always accurate and up-to-date.

## Updating Versions

### Method 1: Using the Update Script (Recommended)

```bash
# Update minor version (recommended for regular updates)
npm run update-version minor

# Update patch version (for bug fixes)
npm run update-version patch

# Update major version (for breaking changes)
npm run update-version major
```

### Method 2: Using npm version commands

```bash
# Update minor version: 1.1.0 → 1.2.0
npm run version:minor

# Update patch version: 1.1.0 → 1.1.1
npm run version:patch

# Update major version: 1.1.0 → 2.0.0
npm run version:major
```

### Method 3: Manual Update

1. Edit `package.json` and update the `version` field
2. The footer will automatically reflect the new version

## Workflow for Updates

1. **Make your changes** to the application
2. **Update the version** using one of the methods above
3. **Build the application**: `npm run build`
4. **Commit your changes**: 
   ```bash
   git add -A
   git commit -m "chore: bump version to x.x.x"
   ```
5. **Deploy** to production

## Version History

- **1.1.0** - Added dynamic version display in footer, improved reset password functionality, fixed auth integration tests
- **1.0.0** - Initial release

## Notes

- The version is automatically imported from `package.json` in the Footer component
- No manual updates to the Footer component are needed when changing versions
- The `--no-git-tag-version` flag prevents automatic git tagging, giving you control over commits
