declare module 'next-pwa' {
  type PWAConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    sw?: string;
    [key: string]: unknown;
  };

  const withPWA: (config: PWAConfig) => (nextConfig: Record<string, unknown>) => Record<string, unknown>;

  export default withPWA;
}
