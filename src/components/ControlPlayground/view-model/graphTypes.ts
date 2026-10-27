export interface GraphSeries {
  label: string;
  color: string;
  values: number[];
  dash: boolean;
}

export interface GraphModel {
  series: GraphSeries[];
  min: number;
  max: number;
  unit: string;
  suffix: string;
}
