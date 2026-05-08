const PHONE_MAX_DIGITS = 11;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function getPhoneDigits(value: string) {
  return onlyDigits(value).slice(0, PHONE_MAX_DIGITS);
}

export function formatBrazilianPhone(value: string) {
  const digits = getPhoneDigits(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}