## Code Organization

### Structure

Layers:
  - api -  Extension facing part of razorback that uses `core` services -- nothing outside of `api/` can depend on `api/`
  - base - Provides general utilities -- In sync with vscode source `vs/base`
  - core - Base services for razorback