declare module "elevenlabs-node" {
  export class ElevenLabs {
    constructor(config: { apiKey: string });

    textToSpeech(params: {
      voiceId: string;
      text: string;
      modelId?: string;
      voiceSettings?: {
        stability?: number;
        similarityBoost?: number;
      };
    }): Promise<Buffer>;
  }
}
