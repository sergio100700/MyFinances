import { getSettingsCache } from './storage';

export const formatCurrency = (amount: number): string => {
  const settings = getSettingsCache();
  return `${settings.currencySymbol}${Math.abs(amount).toLocaleString('es-ES', { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2 
  })}`;
};

export const getCurrencySymbol = (): string => {
  const settings = getSettingsCache();
  return settings.currencySymbol;
};
