import { DataPoint } from '../lib/DataSet';

export class ProjectorScatterPlotAdapter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: number[][];
  private highlightedIndices: Set<number>;
  private scale: number;
  private offsetX: number;
  private offsetY: number;
  private padding: number = 20;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.data = [];
    this.highlightedIndices = new Set();
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('wheel', this.handleZoom);
    this.canvas.addEventListener('mousedown', this.handlePanStart);
    this.canvas.addEventListener('mousemove', this.handlePanMove);
    this.canvas.addEventListener('mouseup', this.handlePanEnd);
    this.canvas.addEventListener('mouseleave', this.handlePanEnd);
  }

  private handleZoom = (event: WheelEvent) => {
    event.preventDefault();
    const zoom = event.deltaY < 0 ? 1.1 : 0.9;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Adjust offset to zoom towards mouse position
    this.offsetX = mouseX - (mouseX - this.offsetX) * zoom;
    this.offsetY = mouseY - (mouseY - this.offsetY) * zoom;
    this.scale *= zoom;

    this.render();
  };

  private isPanning = false;
  private lastX = 0;
  private lastY = 0;

  private handlePanStart = (event: MouseEvent) => {
    this.isPanning = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private handlePanMove = (event: MouseEvent) => {
    if (!this.isPanning) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.offsetX += dx;
    this.offsetY += dy;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.render();
  };

  private handlePanEnd = () => {
    this.isPanning = false;
  };

  updateScatterPlotPositions(newData: number[][]) {
    console.log('Updating scatter plot with new data:', newData);
    this.data = newData;
    this.resetView();
    this.render();
  }

  private resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  highlightPoints(indices: number[]) {
    this.highlightedIndices = new Set(indices);
    this.render();
  }

  getPointFromCoordinates(x: number, y: number): number | undefined {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = (x - rect.left - this.offsetX) / this.scale;
    const canvasY = (y - rect.top - this.offsetY) / this.scale;

    let closestPoint: number | undefined;
    let closestDistance = Infinity;

    this.data.forEach((point, index) => {
      const [px, py] = this.mapToCanvas(point);
      const dx = px - canvasX;
      const dy = py - canvasY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = index;
      }
    });

    return closestPoint;
  }

  private render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    console.log('Rendering', this.data.length, 'points');
    console.log('Canvas dimensions:', width, 'x', height);

    const [xMin, xMax] = this.getExtent(this.data, 0);
    const [yMin, yMax] = this.getExtent(this.data, 1);
    console.log('X extent:', xMin, '-', xMax);
    console.log('Y extent:', yMin, '-', yMax);

    // Render each point
    this.data.forEach((point, index) => {
      const [x, y] = this.mapToCanvas(point);

      if (index < 5) {
        console.log(`Point ${index}:`, point, 'mapped to:', x, y);
      }

      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
      
      if (this.highlightedIndices.has(index)) {
        this.ctx.fillStyle = 'red';
      } else {
        this.ctx.fillStyle = 'blue';
      }
      
      this.ctx.fill();
    });

    console.log('Rendering complete');
  }

  private mapToCanvas(point: number[]): [number, number] {
    const { width, height } = this.canvas;
    const [xMin, xMax] = this.getExtent(this.data, 0);
    const [yMin, yMax] = this.getExtent(this.data, 1);

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const xScale = (width - 2 * this.padding) / xRange;
    const yScale = (height - 2 * this.padding) / yRange;

    const scaleFactor = Math.min(xScale, yScale);

    const x = (point[0] - xMin) * scaleFactor * this.scale + this.offsetX + this.padding;
    const y = height - ((point[1] - yMin) * scaleFactor * this.scale + this.offsetY + this.padding);

    return [x, y];
  }

  private getExtent(data: number[][], dimension: number): [number, number] {
    const values = data.map(point => point[dimension]);
    return [Math.min(...values), Math.max(...values)];
  }
}
