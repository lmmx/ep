'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataSet, DataPoint } from '../lib/DataSet';
import { DimensionalityReducer } from '../lib/DimensionalityReducer';
import { SearchComponent } from '../lib/SearchComponent';
import { NearestNeighborSearcher } from '../lib/NearestNeighborSearcher';
import { ProjectorScatterPlotAdapter } from './ProjectorScatterPlotAdapter';
import { loadEmbeddingsInChunks } from '../lib/dataLoader';

type DimensionalityReductionMethod = 'pca' | 'tsne' | 'umap';

const Projector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataSet, setDataSet] = useState<DataSet | null>(null);
  const [projectedData, setProjectedData] = useState<number[][] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reductionMethod, setReductionMethod] = useState<DimensionalityReductionMethod>('pca');
  const [highlightedPoints, setHighlightedPoints] = useState<number[]>([]);

  const dimensionalityReducer = useRef(new DimensionalityReducer());
  const searcher = useRef<SearchComponent | null>(null);
  const nearestNeighborSearcher = useRef<NearestNeighborSearcher | null>(null);
  const projectorScatterPlotAdapter = useRef<ProjectorScatterPlotAdapter | null>(null);

  useEffect(() => {
    const loadData = async () => {
      let points: number[][] = [];
      let metadata: { [key: string]: any }[] = [];

      for await (const { chunk, nSamples, nDimensions } of loadEmbeddingsInChunks()) {
        for (let i = 0; i < chunk.length; i += nDimensions) {
          points.push(Array.from(chunk.subarray(i, i + nDimensions)));
          metadata.push({ index: points.length - 1 });
        }
      }

      const newDataSet = new DataSet(
        points.map((vector, index) => new DataPoint(vector, metadata[index]))
      );
      setDataSet(newDataSet);
      searcher.current = new SearchComponent(newDataSet);
      nearestNeighborSearcher.current = new NearestNeighborSearcher(newDataSet);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (dataSet && canvasRef.current) {
      projectorScatterPlotAdapter.current = new ProjectorScatterPlotAdapter(canvasRef.current);
      projectData();
    }
  }, [dataSet]);

  const projectData = async () => {
    if (dataSet) {
      const newProjectedData = await dimensionalityReducer.current.reduceDimensions(
        dataSet.points.map(p => p.vector),
        reductionMethod,
        3
      );
      setProjectedData(newProjectedData);
      projectorScatterPlotAdapter.current?.updateScatterPlotPositions(newProjectedData);
    }
  };

  useEffect(() => {
    projectData();
  }, [reductionMethod]);

  const handleSearch = () => {
    if (searcher.current) {
      const results = searcher.current.search(searchQuery);
      setHighlightedPoints(results);
      projectorScatterPlotAdapter.current?.highlightPoints(results);
    }
  };

  const handlePointClick = (index: number) => {
    if (nearestNeighborSearcher.current) {
      const neighbors = nearestNeighborSearcher.current.findNearestNeighbors(index, 10);
      const neighborIndices = neighbors.map(n => n.index);
      setHighlightedPoints(neighborIndices);
      projectorScatterPlotAdapter.current?.highlightPoints(neighborIndices);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search points"
          className="mr-2 p-2 border rounded flex-grow"
        />
        <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Search
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="reduction-method" className="mr-2">Dimensionality Reduction Method:</label>
        <select
          id="reduction-method"
          value={reductionMethod}
          onChange={(e) => setReductionMethod(e.target.value as DimensionalityReductionMethod)}
          className="p-2 border rounded"
        >
          <option value="pca">PCA</option>
          <option value="tsne">t-SNE</option>
          <option value="umap">UMAP</option>
        </select>
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-auto border border-gray-300 rounded shadow-lg"
        onClick={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const point = projectorScatterPlotAdapter.current?.getPointFromCoordinates(x, y);
            if (point !== undefined) handlePointClick(point);
          }
        }}
      />
      {highlightedPoints.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Highlighted Points:</h3>
          <ul className="list-disc pl-5">
            {highlightedPoints.slice(0, 5).map((index) => (
              <li key={index}>Point {index}</li>
            ))}
            {highlightedPoints.length > 5 && <li>... and {highlightedPoints.length - 5} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Projector;
