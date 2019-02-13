## Code Organization

### Structure

Layers:

- api - Extension facing part of razorback that uses `core` customers
- base - Provides general utilities -- In sync with vscode source `vs/base`
- core - Editor facing side of Razorback. `Only` custormer of `editor` services
- editor - Defines services that interacts with NeoVim.
