import { TypeConstraint } from '../base/types';

export interface ICommandHandlerDescription {
  description: string;
  args: { name: string; description?: string; constraint?: TypeConstraint; }[];
  returns?: string;
}
