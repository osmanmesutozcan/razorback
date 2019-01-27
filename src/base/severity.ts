
enum Severity {
  Ignore = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
}

namespace Severity {

  const _error = 'error';
  const _warning = 'warning';
  const _warn = 'warn';
  const _info = 'info';

  /**
   * Parses 'error', 'warning', 'warn', 'info' in call casings
   * and falls back to ignore.
   */
  export function fromValue(_value: string): Severity {
    if (!_value) {
      return Severity.Ignore;
    }

    const value = _value.toLowerCase();

    if (_error === value) {
      return Severity.Error;
    }

    if ((_warning === value) || (_warn === value)) {
      return Severity.Warning;
    }

    if (_info === value) {
      return Severity.Info;
    }
    return Severity.Ignore;
  }
}

export default Severity;
