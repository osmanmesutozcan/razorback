import { Window as NeovimWindow } from 'neovim';
import { TextDocument } from '../documents/document';

// Location of the editor in the window
// Here only for ducktype reasons.
export enum ViewColumn {
  Active = -1,
  One = 1,
}

export class TextEditor {
  readonly viewColumn = undefined;

  constructor(
    private readonly window: NeovimWindow,
    private readonly document: TextDocument,
  ) { }
}
