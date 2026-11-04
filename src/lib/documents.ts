const onlyDigits = (value: string) => value.replace(/\D/g, '')

const allSame = (digits: string) => /^(\d)\1+$/.test(digits)

// dígito verificador: soma ponderada (pesos a partir de `start`, decrescente)
function checkDigit(digits: string, weights: number[]) {
  const sum = weights.reduce((acc, w, i) => acc + Number(digits[i]) * w, 0)
  const rest = sum % 11
  return rest < 2 ? 0 : 11 - rest
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || allSame(cpf)) return false

  const d1 = checkDigit(cpf, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = checkDigit(cpf, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])

  return d1 === Number(cpf[9]) && d2 === Number(cpf[10])
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || allSame(cnpj)) return false

  const d1 = checkDigit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = checkDigit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
}
