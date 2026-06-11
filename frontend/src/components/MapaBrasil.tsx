import { useEffect, useMemo, useState } from 'react';

interface GeoEstado {
  uf: string;
  receita?: number;
  qtde_vendas?: number;
  ticket_medio?: number;
  margem_pct?: number;
  participacao_pct?: number;
  crescimento_mom?: number;
}

interface MapaBrasilProps {
  estados: GeoEstado[];
  estadoSelecionado?: string | null;
  onEstadoClick?: (uf: string) => void;
  metrica?: 'receita' | 'qtde_vendas' | 'ticket_medio' | 'margem_pct';
}

const UF_SIGLAS: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
};

const UF_CODES: Record<string, string> = {
  '11': 'RO',
  '12': 'AC',
  '13': 'AM',
  '14': 'RR',
  '15': 'PA',
  '16': 'AP',
  '17': 'TO',
  '21': 'MA',
  '22': 'PI',
  '23': 'CE',
  '24': 'RN',
  '25': 'PB',
  '26': 'PE',
  '27': 'AL',
  '28': 'SE',
  '29': 'BA',
  '31': 'MG',
  '32': 'ES',
  '33': 'RJ',
  '35': 'SP',
  '41': 'PR',
  '42': 'SC',
  '43': 'RS',
  '50': 'MS',
  '51': 'MT',
  '52': 'GO',
  '53': 'DF',
};

const UF_NAMES: Record<string, string> = {
  RO: 'Rondônia',
  AC: 'Acre',
  AM: 'Amazonas',
  RR: 'Roraima',
  PA: 'Pará',
  AP: 'Amapá',
  TO: 'Tocantins',
  MA: 'Maranhão',
  PI: 'Piauí',
  CE: 'Ceará',
  RN: 'Rio Grande do Norte',
  PB: 'Paraíba',
  PE: 'Pernambuco',
  AL: 'Alagoas',
  SE: 'Sergipe',
  BA: 'Bahia',
  MG: 'Minas Gerais',
  ES: 'Espírito Santo',
  RJ: 'Rio de Janeiro',
  SP: 'São Paulo',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
  MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',
  GO: 'Goiás',
  DF: 'Distrito Federal',
};

const IBGE_STATE_URL = (id: string) =>
  `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${id}?resolucao=2&formato=application/vnd.geo+json&qualidade=minima`;

const flattenCoordinates = (arr: unknown): [number, number][] => {
  if (!Array.isArray(arr)) return [];
  if (typeof arr[0] === 'number' && typeof arr[1] === 'number') return [arr as [number, number]];
  return arr.flatMap(flattenCoordinates);
};

export default function MapaBrasil({
  estados,
  estadoSelecionado = null,
  onEstadoClick,
  metrica = 'receita',
}: MapaBrasilProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; uf: string; nome: string; part: number; mom: number } | null>(null);

  useEffect(() => {
    Promise.all(
      Object.entries(UF_CODES).map(([id, uf]) =>
        fetch(IBGE_STATE_URL(id))
          .then((response) => response.json())
          .then((data) => (data.features || []).map((feature: any) => ({
            ...feature,
            properties: { ...(feature.properties || {}), sigla: uf, name: UF_NAMES[uf], nome: UF_NAMES[uf] },
          })))
      )
    )
      .then((features) => setGeoData({ type: 'FeatureCollection', features: features.flat() }))
      .catch(() => setGeoData({ type: 'FeatureCollection', features: [] }));
  }, []);

  const maxVal = Math.max(...estados.map((estado) => Number(estado[metrica] || 0)), 1);

  const allCoords = useMemo(() => {
    const features = geoData?.features ?? [];
    return features.flatMap((feature: any) => flattenCoordinates(feature.geometry?.coordinates || []));
  }, [geoData]);

  if (!geoData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, background: '#F8FAFC', borderRadius: 8 }}>
        <div style={{ color: '#64748B' }}>Carregando mapa oficial do IBGE...</div>
      </div>
    );
  }

  if (allCoords.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, background: '#FEF2F2', borderRadius: 8, color: '#991B1B' }}>
        GeoJSON do IBGE não carregou.
      </div>
    );
  }

  const minX = Math.min(...allCoords.map((coord: [number, number]) => coord[0]));
  const maxX = Math.max(...allCoords.map((coord: [number, number]) => coord[0]));
  const minY = Math.min(...allCoords.map((coord: [number, number]) => coord[1]));
  const maxY = Math.max(...allCoords.map((coord: [number, number]) => coord[1]));
  const W = 800;
  const H = 620;
  const pad = 20;
  const scale = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad) / (maxY - minY));
  const toX = (lng: number) => pad + (lng - minX) * scale;
  const toY = (lat: number) => H - pad - (lat - minY) * scale;

  const polyToPath = (ring: [number, number][]) =>
    ring.map((coord, index) => `${index === 0 ? 'M' : 'L'}${toX(coord[0]).toFixed(1)},${toY(coord[1]).toFixed(1)}`).join(' ') + ' Z';

  const featureToPath = (geometry: any): string => {
    if (geometry?.type === 'Polygon') return geometry.coordinates.map((ring: [number, number][]) => polyToPath(ring)).join(' ');
    if (geometry?.type === 'MultiPolygon') {
      return geometry.coordinates.flatMap((polygon: [number, number][][]) => polygon.map((ring) => polyToPath(ring))).join(' ');
    }
    return '';
  };

  const getUF = (props: any): string => {
    const nome = props?.NM_ESTADO || props?.nome || props?.name || props?.name_1 || '';
    return props?.sigla || UF_CODES[String(props?.codarea || '')] || UF_SIGLAS[nome] || props?.SIGLA || props?.UF_05 || props?.uf || '';
  };

  const getColor = (uf: string) => {
    const estado = estados.find((item) => item.uf === uf);
    const value = Number(estado?.[metrica] || 0);
    if (!estado || !value) return '#E2E8F0';
    const intensity = value / maxVal;
    const r = Math.round(30 + (239 - 30) * (1 - intensity));
    const g = Math.round(64 + (246 - 64) * (1 - intensity));
    const b = Math.round(175 + (255 - 175) * (1 - intensity));
    return `rgb(${r},${g},${b})`;
  };

  const formatVal = (uf: string) => {
    const estado = estados.find((item) => item.uf === uf);
    const value = Number(estado?.[metrica] || 0);
    if (!estado || !value) return 'Sem dados';
    if (metrica === 'receita' || metrica === 'ticket_medio') return `R$ ${value.toLocaleString('pt-BR')}`;
    if (metrica === 'margem_pct') return `${value.toFixed(1)}%`;
    return `${value} vendas`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#F0F7FF', borderRadius: 8 }}>
        {geoData.features?.map((feature: any, index: number) => {
          const uf = getUF(feature.properties);
          const isSelected = uf === estadoSelecionado;
          const path = featureToPath(feature.geometry);
          const estado = estados.find((item) => item.uf === uf);
          if (!path) return null;
          return (
            <path
              key={`${uf || 'uf'}-${index}`}
              d={path}
              fill={isSelected ? '#1E40AF' : getColor(uf)}
              stroke={isSelected ? '#1E3A8A' : '#CBD5E1'}
              strokeWidth={isSelected ? 1.5 : 0.5}
              style={{ cursor: uf ? 'pointer' : 'default', transition: 'fill 0.2s' }}
              onMouseEnter={(event) => {
                if (!uf) return;
                setTooltip({
                  x: event.clientX,
                  y: event.clientY,
                  uf,
                  nome: feature.properties?.NM_ESTADO || feature.properties?.nome || feature.properties?.name || uf,
                  part: estado?.participacao_pct || 0,
                  mom: estado?.crescimento_mom || 0,
                });
              }}
              onMouseMove={(event) => setTooltip((current) => current ? { ...current, x: event.clientX, y: event.clientY } : null)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => uf && onEstadoClick?.(uf)}
            />
          );
        })}
      </svg>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y - 10,
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 9999,
          pointerEvents: 'none',
          minWidth: 170,
        }}>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{tooltip.uf} - {tooltip.nome}</div>
          <div style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>{formatVal(tooltip.uf)}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Participação: {tooltip.part.toFixed(1)}%</div>
          <div style={{ fontSize: 12, marginTop: 2, color: tooltip.mom >= 0 ? '#10B981' : '#EF4444' }}>
            MoM: {tooltip.mom >= 0 ? '▲' : '▼'} {Math.abs(tooltip.mom).toFixed(1)}%
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'center', fontSize: 12, color: '#64748B' }}>
        <span>Sem dados</span>
        <div style={{ width: 120, height: 10, borderRadius: 4, background: 'linear-gradient(to right, #EFF6FF, #1E40AF)' }} />
        <span>Maior volume</span>
      </div>
    </div>
  );
}
