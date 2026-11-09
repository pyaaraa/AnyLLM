export interface AnyLLMApiCallUsage {
    service_tier?: string;
    input?: number;
    input_image?: number;
    input_audio?: number;
    input_audio_time?: number;
    output?: number;
    output_audio?: number;
    image?: number;
    image_quality?: string;
    image_size?: string;
    web_search?: number;
    code_interpreter?: number;
    request?: number;
    input_cache_reads?: number;
    input_cache_writes?: number;
}
export interface AnyLLMLedgerMetadataApiCallTimestamps {
    start: number;
    first_token?: number;
    end: number;
}
export interface AnyLLMLedgerMetadataApiCall {
    type: "api-call";
    data: {
        api_key_id?: string;
        model: string;
        provider: string;
        endpoint: string;
        status: number;
        stream?: boolean;
        error?: string;
        timestamps: AnyLLMLedgerMetadataApiCallTimestamps;
        ip?: string;
        referer: {
            name?: string;
            url?: string;
        };
        usage?: AnyLLMApiCallUsage;
    };
}
export type AnyLLMLedgerMetadata = AnyLLMLedgerMetadataApiCall;
