interface AppConfig {
    pinata: {
      gatewayUrl: string;
      apiUrl: string;
    };
    app: {
      name: string;
      version: string;
      debugMode: boolean;
    };
  }
  
  const config: AppConfig = {
    pinata: {
      gatewayUrl: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud',
      apiUrl: 'https://api.pinata.cloud',
    },
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || '去中心化留言板',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    },
  };
  
  export default config;