export type SignUpFields = {
  fullName: string;
  email: string;
  cpf: string;
  password: string;
  passwordConfirmation: string;
};

export type SignUpErrors = Partial<Record<keyof SignUpFields, string>>;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

export function validateSignUp(fields: SignUpFields): SignUpErrors {
  const errors: SignUpErrors = {};
  if (fields.fullName.trim().length < 2) errors.fullName = 'Informe pelo menos 2 caracteres.';
  if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (!isValidCpf(fields.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (!fields.password) errors.password = 'Crie uma senha.';
  if (!fields.passwordConfirmation) errors.passwordConfirmation = 'Repita a senha.';
  else if (fields.password !== fields.passwordConfirmation) errors.passwordConfirmation = 'As senhas precisam ser iguais.';
  return errors;
}
