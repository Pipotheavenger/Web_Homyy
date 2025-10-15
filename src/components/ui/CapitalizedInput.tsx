import React, { useState, useEffect } from 'react';
import { capitalizeText, capitalizeFirstLetter, capitalizeProperName } from '@/lib/utils';

interface CapitalizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  capitalizeType?: 'all' | 'first' | 'proper';
  onValueChange?: (value: string) => void;
}

export const CapitalizedInput: React.FC<CapitalizedInputProps> = ({
  capitalizeType = 'all',
  onValueChange,
  onChange,
  value,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let capitalizedValue = inputValue;

    // Aplicar capitalización según el tipo
    switch (capitalizeType) {
      case 'first':
        capitalizedValue = capitalizeFirstLetter(inputValue);
        break;
      case 'proper':
        capitalizedValue = capitalizeProperName(inputValue);
        break;
      case 'all':
      default:
        capitalizedValue = capitalizeText(inputValue);
        break;
    }

    setInternalValue(capitalizedValue);

    // Crear un nuevo evento con el valor capitalizado
    const capitalizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: capitalizedValue
      }
    };

    // Llamar a onChange del padre si existe
    if (onChange) {
      onChange(capitalizedEvent as React.ChangeEvent<HTMLInputElement>);
    }

    // Llamar a onValueChange si existe
    if (onValueChange) {
      onValueChange(capitalizedValue);
    }
  };

  return (
    <input
      {...props}
      value={internalValue}
      onChange={handleChange}
    />
  );
};

interface CapitalizedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  capitalizeType?: 'all' | 'first' | 'proper';
  onValueChange?: (value: string) => void;
}

export const CapitalizedTextarea: React.FC<CapitalizedTextareaProps> = ({
  capitalizeType = 'all',
  onValueChange,
  onChange,
  value,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    let capitalizedValue = inputValue;

    // Aplicar capitalización según el tipo
    switch (capitalizeType) {
      case 'first':
        capitalizedValue = capitalizeFirstLetter(inputValue);
        break;
      case 'proper':
        capitalizedValue = capitalizeProperName(inputValue);
        break;
      case 'all':
      default:
        capitalizedValue = capitalizeText(inputValue);
        break;
    }

    setInternalValue(capitalizedValue);

    // Crear un nuevo evento con el valor capitalizado
    const capitalizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: capitalizedValue
      }
    };

    // Llamar a onChange del padre si existe
    if (onChange) {
      onChange(capitalizedEvent as React.ChangeEvent<HTMLTextAreaElement>);
    }

    // Llamar a onValueChange si existe
    if (onValueChange) {
      onValueChange(capitalizedValue);
    }
  };

  return (
    <textarea
      {...props}
      value={internalValue}
      onChange={handleChange}
    />
  );
};
