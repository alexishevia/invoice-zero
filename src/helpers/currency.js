
// converts a string into cents (integer)
// eg: '$1.50' -> 150
export function strToCents(str) {
  return Number.parseInt((str || '').replace(/\D/g, ''));
}

// converts cents (integer) to nicely formatted dollars (string)
// eg: 1510 -> 15.10
export function centsToDollar(cents) {
  const dollars = (cents || 0) / 100.0;
  if (Number.isNaN(dollars)) {
    return '0.00';
  }
  return `${dollars.toFixed(2)}`;
}
