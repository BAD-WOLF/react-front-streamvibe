import {rawRequest} from '@shared/api/httpClient.ts';
import type {HealthResponse} from '@shared/types/api/health.ts';

/**
 * GET /health: a API está de pé? (sem idioma, sem JWT e sem envelope)
 */
export async function getHealthService(signal?: AbortSignal): Promise<HealthResponse> {
    return rawRequest<HealthResponse>('/health', {signal});
}
