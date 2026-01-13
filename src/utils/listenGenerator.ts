export const generateUniqueListen = async (): Promise<number> => {
    try {
        const serversRes = await fetch('/api/mock/config/servers');
        if (!serversRes.ok) throw new Error('Error al obtener lista de servidores');

        const serversData = await serversRes.json();
        let serverNames: string[] = [];

        if (Array.isArray(serversData)) {
            serverNames = serversData.map((s: any) =>
                typeof s === 'string' ? s : s?.name
            ).filter(Boolean);
        } else if (serversData?.servers && Array.isArray(serversData.servers)) {
            serverNames = serversData.servers.map((s: any) =>
                typeof s === 'string' ? s : s?.name
            ).filter(Boolean);
        }

        const usedListens = new Set<number>();

        await Promise.all(
            serverNames.map(async (name) => {
                try {
                    const configRes = await fetch(`/api/mock/config?server_name=${name}`);
                    if (configRes.ok) {
                        const config = await configRes.json();
                        const serverConfig = config.server_config || config?.http?.servers?.[0];
                        const listen = serverConfig?.listen;

                        if (typeof listen === 'number') {
                            usedListens.add(listen);
                        }
                    }
                } catch (err) {
                    console.warn(`No se pudo obtener config de ${name}:`, err);
                }
            })
        );

        let uniqueListen = 0;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            uniqueListen = Math.floor(1000 + Math.random() * 9000);
            attempts++;
        } while (usedListens.has(uniqueListen) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error('No se pudo generar un listen único después de múltiples intentos.');
        }

        return uniqueListen;

    } catch (error) {
        console.error('Error generando listen único:', error);
        return Math.floor(1000 + Math.random() * 9000);
    }
};
