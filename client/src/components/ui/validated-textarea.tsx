import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Asterisk } from "lucide-react";

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  validationFn?: (value: string) => { isValid: boolean; message?: string };
  helpText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ 
    label, 
    required = false, 
    error, 
    isValid, 
    onValidationChange,
    validationFn,
    helpText,
    maxLength,
    showCharCount = false,
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Verificar limite de caracteres
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsTouched(true);
      onBlur?.(e);
    };

    const showError = isTouched && (error || validationState.message);
    const showSuccess = isTouched && !error && !validationState.message && internalValue && validationState.isValid;
    const inputIsValid = isValid !== undefined ? isValid : validationState.isValid;
    const charCount = String(internalValue).length;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
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
          
          {showCharCount && maxLength && (
            <span className={cn(
              "text-xs",
              charCount > maxLength * 0.9 ? "text-orange-500" : "text-muted-foreground",
              charCount === maxLength && "text-red-500"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        
        <div className="relative">
          <Textarea
            ref={ref}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "transition-all duration-200 resize-none",
              showError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              showSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
              className
            )}
            {...props}
          />
          
          {/* Ícone de validação */}
          {isTouched && (
            <div className="absolute right-3 top-3">
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

ValidatedTextarea.displayName = "ValidatedTextarea";