export interface GeneratorOutput {
  type: string;
  count: number;
  totalKwhPerType: number;
}

export interface UserGenerators {
  generators: GeneratorOutput[];
  totalKwh: number;
}


export interface GeneratorType {
  typeKey: string;
  label: string;
  icon: string;
  productionRateKwh: number;
}
