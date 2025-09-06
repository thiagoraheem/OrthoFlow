import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Asterisk } from "lucide-react";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  validationFn?: (value: string) => { isValid: boolean; message?: string };
  helpText?: string;
  formatFn?: (value: string) => string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    label, 
    required = false, 
    error, 
    isValid, 
    onValidationChange,
    validationFn,
    helpText,
    formatFn,
    className,
    onChange,
    onBlur,
    value,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || "");
    const [isTouched, setIsTouched] = useState(false);
    const [validationState, setValidationState] = useState<{
      isValid: boolean;
      message?: string;
    }>({ isValid: true });

    // Validação em tempo real
    useEffect(() => {
      if (validationFn && isTouched) {
        const result = validationFn(String(internalValue));
        setValidationState(result);
        onValidationChange?.(result.isValid);
      }
    }, [internalValue, validationFn, isTouched, onValidationChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      
      // Aplicar formatação se fornecida
      if (formatFn) {
        newValue = formatFn(newValue);
      }
      
      setInternalValue(newValue);
      
      // Criar evento sintético com valor formatado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue
        }
      };
      
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);
      onBlur?.(e);
    };

    const showError = isTouched && (error || validationState.message);
    const showSuccess = isTouched && !error && !validationState.message && internalValue && validationState.isValid;
    const inputIsValid = isValid !== undefined ? isValid : validationState.isValid;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label 
            htmlFor={props.id} 
            className={cn(
              "text-sm font-medium",
              required && "flex items-center gap-1"
            )}
          >
            {label}
            {required && (
              <Asterisk className="h-3 w-3 text-red-500" />
            )}
          </Label>
        </div>
        
        <div className="relative">
          <Input
            ref={ref}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "pr-10 transition-all duration-200",
              showError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              showSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
              className
            )}
            {...props}
          />
          
          {/* Ícone de validação */}
          {isTouched && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : showSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        
        {/* Mensagens de ajuda e erro */}
        <div className="min-h-[1.25rem]">
          {showError ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error || validationState.message}
            </p>
          ) : helpText && !isTouched ? (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";