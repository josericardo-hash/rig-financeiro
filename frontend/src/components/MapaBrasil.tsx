import { MouseEvent, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { BRAZIL_GEOJSON } from '../data/brazil-geojson';
import { formatCurrency } from '../services/api';

type Estado = {
  uf: string;
  estado?: string;
  receita: number;
  pedidos?: number;
  qtde_vendas?: number;
  ticket_medio?: number;
  margem_pct?: number;
  participacao_pct?: number;
  crescimento_mom?: number;
};

type Metrica = 'receita' | 'qtde_vendas' | 'ticket_medio' | 'margem_pct';

type TooltipData = {
  x: number;
  y: number;
  uf: string;
  nome: string;
  texto: string;
  participacao: number;
  crescimento: number;
};

const colorScales: Record<Metrica, [string, string]> = {
  receita: ['#DBEAFE', '#1E40AF'],
  qtde_vendas: ['#DCFCE7', '#166534'],
  ticket_medio: ['#FFEDD5', '#9A3412'],
  margem_pct: ['#DCFCE7', '#14532D'],
};

const WIDTH = 800;
const HEIGHT = 600;
const PADDING = 44;

const allPoints = BRAZIL_GEOJSON.features.flatMap((feature) => feature.geometry.coordinates[0]);
const minLon = Math.min(...allPoints.map(([lon]) => lon));
const maxLon = Math.max(...allPoints.map(([lon]) => lon));
const minLat = Math.min(...allPoints.map(([, lat]) => lat));
const maxLat = Math.max(...allPoints.map(([, lat]) => lat));
const scale = Math.min((WIDTH - PADDING * 2) / (maxLon - minLon), (HEIGHT - PADDING * 2) / (maxLat - minLat));
const mapWidth = (maxLon - minLon) * scale;
const mapHeight = (maxLat - minLat) * scale;
const offsetX = (WIDTH - mapWidth) / 2;
const offsetY = (HEIGHT - mapHeight) / 2;

const projectPoint = ([lon, lat]: number[]) => {
  const x = offsetX + (lon - minLon) * scale;
  const y = offsetY + (maxLat - lat) * scale;
  return [x, y];
};

const polygonPath = (coordinates: number[][]) => coordinates
  .map((point, index) => {
    const [x, y] = projectPoint(point);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  })
  .join(' ') + ' Z';

export default function MapaBrasil({
  estados,
  estadoSelecionado = null,
  onEstadoClick,
  metrica = 'receita',
}: {
  estados: Estado[];
  estadoSelecionado?: string | null;
  onEstadoClick?: (uf: string) => void;
  metrica?: Metrica;
}) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const maxVal = Math.max(...estados.map((estado) => Number(estado[metrica] ?? estado.receita ?? 0)), 1);
  const colorScale = useMemo(() => scaleLinear<string>().domain([0, maxVal]).range(colorScales[metrica]), [maxVal, metrica]);

  const getEstado = (uf: string) => estados.find((estado) => estado.uf === uf);
  const getColor = (uf: string) => {
    const estado = getEstado(uf);
    const value = Number(estado?.[metrica] ?? estado?.receita ?? 0);
    return value > 0 ? colorScale(value) : '#F8FAFC';
  };

  const formatMetrica = (estado: Estado | undefined) => {
    if (!estado) return 'Sem dados';
    const value = Number(estado[metrica] ?? estado.receita ?? 0);
    if (metrica === 'receita' || metrica === 'ticket_medio') return formatCurrency(value);
    if (metrica === 'margem_pct') return `${value.toFixed(1)}%`;
    return `${value} vendas`;
  };

  const handleMouseMove = (event: MouseEvent<SVGPathElement>, uf: string, nome: string) => {
    const estado = getEstado(uf);
    setTooltip({
      x: event.clientX + 12,
      y: event.clientY - 10,
      uf,
      nome: estado?.estado || nome || uf,
      texto: formatMetrica(estado),
      participacao: estado?.participacao_pct ?? 0,
      crescimento: estado?.crescimento_mom ?? 0,
    });
  };

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Mapa do Brasil por estado">
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#EEF2F7" rx="8" />
        {BRAZIL_GEOJSON.features.map((feature) => {
          const uf = feature.properties.sigla;
          const isSelected = uf === estadoSelecionado;
          return (
            <path
              key={uf}
              d={polygonPath(feature.geometry.coordinates[0])}
              fill={getColor(uf)}
              stroke={isSelected ? '#1E40AF' : '#64748B'}
              strokeWidth={isSelected ? 2.5 : 1}
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
              onMouseMove={(event) => handleMouseMove(event, uf, feature.properties.name)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onEstadoClick?.(uf)}
            />
          );
        })}
      </svg>

      <div className="map-legend">
        <span><i style={{ background: colorScales[metrica][1] }} /> Maior volume</span>
        <span><i style={{ background: colorScales[metrica][0] }} /> Menor volume</span>
        <span><i style={{ background: '#F8FAFC', border: '1px solid #64748B' }} /> Sem dados</span>
      </div>

      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y, position: 'fixed', zIndex: 9999, pointerEvents: 'none' }}>
          <strong>{tooltip.uf} - {tooltip.nome}</strong>
          <span>{tooltip.texto}</span>
          <small>Participacao: {tooltip.participacao.toFixed(1)}%</small>
          <small style={{ color: tooltip.crescimento >= 0 ? '#10B981' : '#EF4444' }}>
            MoM: {tooltip.crescimento >= 0 ? '▲' : '▼'} {Math.abs(tooltip.crescimento).toFixed(1)}%
          </small>
        </div>
      )}
    </div>
  );
}
