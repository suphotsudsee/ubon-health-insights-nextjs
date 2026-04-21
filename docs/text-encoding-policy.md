# Text Encoding Policy

This repository treats all source and content files as UTF-8 with LF line endings.

## Rules

1. All text source files must be saved as UTF-8.
2. Do not use shell commands that rewrite source files with unspecified encodings.
3. If Thai text appears garbled in terminal output, verify the file bytes before editing.
4. Run `npm run check:text` before large text-heavy changes or deployments.

## Detection

The repository includes `scripts/check-text-encoding.js`.

It fails when it finds suspicious mojibake markers such as:

- replacement characters
- BOM garble
- common Thai mojibake fragments

## Tooling

- `.editorconfig` declares UTF-8 and LF
- `.gitattributes` pins UTF-8 working-tree encoding
- `.vscode/settings.json` forces UTF-8 in the workspace
- `npm run build` runs `npm run check:text` first
