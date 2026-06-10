const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) return fallback;
    const data = (await response.json()) as T;
    if (Array.isArray(data) && data.length === 0) return fallback;
    if (!Array.isArray(data) && data && Object.keys(data).length === 0) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export const formatPct = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;
