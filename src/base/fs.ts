import * as fs from 'fs';

interface ISection {
  name: string;
  patterns: string[];
}

interface IState {
  patterns: string[];
  sections: ISection[];
}

export function parseGitIgnore(path: string) {
  const ignoreFile = fs.readFileSync(path);

  const lines = ignoreFile.toString().split(/\r?\n/);

  let section: ISection = { name: 'default', patterns: [] };
  const state: IState = { patterns: [], sections: [] };

  for (const line of lines) {
    if (line.charAt(0) === '#') {
      section = { name: line.slice(1).trim(), patterns: [] };
      state.sections.push(section);
      continue;
    }

    if (line.trim() !== '') {
      const pattern = line;
      section.patterns.push(pattern);
      state.patterns.push(pattern);
    }
  }
  return state;
}
