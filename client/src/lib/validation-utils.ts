// Utilitários para validação e formatação de campos

// Formatação de CPF
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

// Formatação de telefone
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }
  return value;
};

// Validação de CPF
export const validateCPF = (cpf: string): { isValid: boolean; message?: string } => {
  if (!cpf) {
    return { isValid: false, message: "CPF é obrigatório" };
  }
  
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return { isValid: false, message: "CPF deve ter 11 dígitos" };
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, message: "CPF inválido" };
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, message: "CPF inválido" };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, message: "CPF inválido" };
  }
  
  return { isValid: true };
};

// Validação de telefone
export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone) {
    return { isValid: false, message: "Telefone é obrigatório" };
  }
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return { isValid: false, message: "Telefone deve ter pelo menos 10 dígitos" };
  }
  
  if (cleanPhone.length > 11) {
    return { isValid: false, message: "Telefone deve ter no máximo 11 dígitos" };
  }
  
  return { isValid: true };
};

// Validação de email
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: true }; // Email é opcional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Email inválido" };
  }
  
  return { isValid: true };
};

// Validação de data de nascimento
export const validateBirthDate = (date: string): { isValid: boolean; message?: string } => {
  if (!date) {
    return { isValid: false, message: "Data de nascimento é obrigatória" };
  }
  
  const birthDate = new Date(date);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: "Data inválida" };
  }
  
  if (birthDate > today) {
    return { isValid: false, message: "Data não pode ser futura" };
  }
  
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age > 120) {
    return { isValid: false, message: "Data muito antiga" };
  }
  
  if (age < 0) {
    return { isValid: false, message: "Data inválida" };
  }
  
  return { isValid: true };
};

// Validação de nome
export const validateName = (name: string, fieldName: string = "Nome"): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: `${fieldName} é obrigatório` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} deve ter pelo menos 2 caracteres` };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} deve ter no máximo 50 caracteres` };
  }
  
  const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: `${fieldName} deve conter apenas letras e espaços` };
  }
  
  return { isValid: true };
};

// Validação de endereço
export const validateAddress = (address: string): { isValid: boolean; message?: string } => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, message: "Endereço é obrigatório" };
  }
  
  if (address.trim().length < 10) {
    return { isValid: false, message: "Endereço deve ter pelo menos 10 caracteres" };
  }
  
  if (address.length > 200) {
    return { isValid: false, message: "Endereço deve ter no máximo 200 caracteres" };
  }
  
  return { isValid: true };
};

// Validação de texto opcional com limite
export const validateOptionalText = (text: string, maxLength: number, fieldName: string): { isValid: boolean; message?: string } => {
  if (!text) {
    return { isValid: true }; // Campo opcional
  }
  
  if (text.length > maxLength) {
    return { isValid: false, message: `${fieldName} deve ter no máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true };
};