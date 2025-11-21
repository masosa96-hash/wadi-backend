// Form validation helpers

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
    message?: string;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateField(value: string, rules: ValidationRule): ValidationResult {
    if (rules.required && !value.trim()) {
        return { isValid: false, error: rules.message || "Este campo es requerido" };
    }

    if (rules.minLength && value.length < rules.minLength) {
        return {
            isValid: false,
            error: rules.message || `Mínimo ${rules.minLength} caracteres`
        };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        return {
            isValid: false,
            error: rules.message || `Máximo ${rules.maxLength} caracteres`
        };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        return { isValid: false, error: rules.message || "Formato inválido" };
    }

    if (rules.custom && !rules.custom(value)) {
        return { isValid: false, error: rules.message || "Valor inválido" };
    }

    return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validateField(email, {
        required: true,
        pattern: emailPattern,
        message: "Email inválido",
    });
}

export function validatePassword(password: string): ValidationResult {
    return validateField(password, {
        required: true,
        minLength: 6,
        message: "La contraseña debe tener al menos 6 caracteres",
    });
}

export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .substring(0, 1000); // Limit length
}

export function sanitizeHtml(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}
