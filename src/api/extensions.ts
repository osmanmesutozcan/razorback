import * as rback from 'razorback';
import { noop } from './noop';

export class ExtHostExtensions {
  getExtension(_extensionId: string): rback.Extension<any> | undefined {
    noop('ExtHostExtensions#getExtension');
    return;
  }

  get all(): rback.Extension<any>[] {
    noop('ExtHostExtensions#all');
    return [];
  }
}
