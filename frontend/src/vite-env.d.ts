/// <reference types="vite/client" />

declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode, SVGProps } from 'react';

  export const ComposableMap: ComponentType<SVGProps<SVGSVGElement> & { projection?: string; projectionConfig?: Record<string, unknown> }>;
  export const Geographies: ComponentType<{ geography: unknown; children: (props: { geographies: Array<any> }) => ReactNode }>;
  export const Geography: ComponentType<SVGProps<SVGPathElement> & { geography: any; style?: Record<string, unknown> }>;
}
