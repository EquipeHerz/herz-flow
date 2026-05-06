const calcDigit = (base: string, weights: number[]) => {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Number(base[i]) * weights[i];
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};

export const generateCnpj = () => {
  while (true) {
    const base = Array.from({ length: 12 }, () => String(Math.floor(Math.random() * 10))).join("");
    if (/^(\d)\1{11}$/.test(base)) continue;
    const d1 = calcDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = calcDigit(`${base}${d1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return `${base}${d1}${d2}`;
  }
};

