export class DataPoint {
  vector: number[];
  metadata: { [key: string]: any };

  constructor(vector: number[], metadata: { [key: string]: any }) {
    this.vector = vector;
    this.metadata = metadata;
  }
}

export class DataSet {
  points: DataPoint[];

  constructor(points: DataPoint[]) {
    this.points = points;
  }

  get dim(): [number, number] {
    if (this.points.length === 0) {
      return [0, 0];
    }
    return [this.points.length, this.points[0].vector.length];
  }

  getSubset(indices: number[]): DataSet {
    return new DataSet(indices.map(i => this.points[i]));
  }

  normalize() {
    const [numPoints, numDimensions] = this.dim;
    
    // Calculate mean and standard deviation for each dimension
    const mean = new Array(numDimensions).fill(0);
    const stdDev = new Array(numDimensions).fill(0);
    
    for (let i = 0; i < numPoints; i++) {
      for (let j = 0; j < numDimensions; j++) {
        mean[j] += this.points[i].vector[j];
      }
    }
    
    for (let j = 0; j < numDimensions; j++) {
      mean[j] /= numPoints;
    }
    
    for (let i = 0; i < numPoints; i++) {
      for (let j = 0; j < numDimensions; j++) {
        stdDev[j] += Math.pow(this.points[i].vector[j] - mean[j], 2);
      }
    }
    
    for (let j = 0; j < numDimensions; j++) {
      stdDev[j] = Math.sqrt(stdDev[j] / numPoints);
    }
    
    // Normalize each point
    for (let i = 0; i < numPoints; i++) {
      for (let j = 0; j < numDimensions; j++) {
        if (stdDev[j] !== 0) {
          this.points[i].vector[j] = (this.points[i].vector[j] - mean[j]) / stdDev[j];
        }
      }
    }
  }
}
