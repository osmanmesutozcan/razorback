/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from './uri';

export function getPathFromAmdModule(requirefn: typeof require, relativePath: string): string {
  return URI.parse((requirefn as any).toUrl(relativePath)).fsPath;
}
