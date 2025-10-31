// Shared Model Interfaces
export interface GeneratorInput {
  type: string;
  count: number;
}

export interface GeneratorOutput {
  type: string;
  count: number;
  totalKwhPerType: number;
}

export interface UserGenerators {
  generators: GeneratorOutput[];
  totalKwh: number;
}

export interface UserGeneratorUpdate {
  generatorType: string;
  count: number;
}
