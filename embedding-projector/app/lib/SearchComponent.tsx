export class SearchComponent {
  private dataSet: DataSet;

  constructor(dataSet: DataSet) {
    this.dataSet = dataSet;
  }

  search(query: string): number[] {
    return this.dataSet.points
      .map((point, index) => ({ point, index }))
      .filter(({ point }) => 
        Object.values(point.metadata).some(value => 
          value.toString().toLowerCase().includes(query.toLowerCase())
        )
      )
      .map(({ index }) => index);
  }
}
