import { UriComponents } from '../../base/uri';

export interface FileSystemEvents {
  created: UriComponents[];
  changed: UriComponents[];
  deleted: UriComponents[];
}
