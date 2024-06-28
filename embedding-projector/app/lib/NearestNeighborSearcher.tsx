import * as knn from './knn';

export class NearestNeighborSearcher {
  private dataSet: DataSet;

  constructor(dataSet: DataSet) {
    this.dataSet = dataSet;
  }

  findNearestNeighbors(pointIndex: number, k: number): knn.NearestEntry[] {
    return this.dataSet.findNeighbors(pointIndex, this.calculateDistance, k);
  }

  private calculateDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
}
