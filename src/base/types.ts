import * as _ from 'lodash';

export type TypeConstraint = string | Function;

export function validateConstraints(
  args: any[],
  constraints: (TypeConstraint | undefined)[],
): void {
  const len = Math.min(args.length, constraints.length);
  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0; i < len; i++) {
    validateConstraint(args[i], constraints[i]);
  }
}

export function validateConstraint(arg: any, constraint: TypeConstraint | undefined): void {

  if (_.isString(constraint)) {
    if (typeof arg !== constraint) {
      throw new Error(`argument does not match constraint: typeof ${constraint}`);
    }
  } else if (_.isFunction(constraint)) {
    if (arg instanceof constraint) {
      return;
    }
    if (!(_.isUndefined(arg) || _.isNull(arg)) && arg.constructor === constraint) {
      return;
    }
    if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
      return;
    }

    throw new Error(
      'argument does not match one of these constraints: '
      + 'arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true',
    );
  }
}
