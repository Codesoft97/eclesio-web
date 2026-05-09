const MAX_MONEY_DIGITS = 14;

function getCurrencyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, MAX_MONEY_DIGITS);
}

export function formatCurrencyInput(value: string) {
  const digits = getCurrencyDigits(value);

  if (!digits) {
    return "";
  }

  const paddedDigits = digits.padStart(3, "0");
  const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const centsPart = paddedDigits.slice(-2);
  const amount = Number(`${integerPart}.${centsPart}`);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function currencyInputToDecimal(value: string) {
  const digits = getCurrencyDigits(value);

  if (!digits) {
    return "";
  }

  const paddedDigits = digits.padStart(3, "0");
  const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const centsPart = paddedDigits.slice(-2);

  return `${integerPart}.${centsPart}`;
}
