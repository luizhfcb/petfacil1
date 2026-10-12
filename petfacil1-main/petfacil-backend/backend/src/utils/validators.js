// Espelha as regras do app (src/utils/validators.ts) para que front e back validem igual.

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function validateSignUp({ fullName, email, cpf, password, passwordConfirmation } = {}) {
  const errors = {};
  if (String(fullName ?? '').trim().length < 2) errors.fullName = 'Informe pelo menos 2 caracteres.';
  if (!/^\S+@\S+\.\S+$/.test(String(email ?? '').trim())) errors.email = 'Informe um e-mail válido.';
  if (!isValidCpf(cpf)) errors.cpf = 'Informe um CPF válido.';
  if (!password) errors.password = 'Crie uma senha.';
  if (passwordConfirmation !== undefined && password !== passwordConfirmation) {
    errors.passwordConfirmation = 'As senhas precisam ser iguais.';
  }
  return errors;
}

module.exports = { onlyDigits, isValidCpf, validateSignUp };
