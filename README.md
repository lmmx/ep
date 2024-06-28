# Embedding Projector (ep)

A Next.js application for visualising high-dimensional embeddings, inspired by TensorFlow Projector but designed for improved performance and scalability.

## Features

- Progressive loading and rendering of large embedding datasets
- Efficient visualisation using WebGL
- Responsive design with Tailwind CSS
- TypeScript for improved type safety and developer experience
- Built with Next.js for optimal performance and easy deployment

## Prerequisites

- Node.js (version 14 or later)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ep.git
   cd ep
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate sample data (if you don't have your own embeddings):
   - Create a Python script `generate_data.py` in the project root:
     ```python
     import numpy as np

     # Generate random 128D data
     n_samples = 10000
     n_dimensions = 128
     data = np.random.randn(n_samples, n_dimensions).astype(np.float32)

     # Save to binary file
     with open('public/data/embeddings.bin', 'wb') as f:
         np.array([n_samples, n_dimensions], dtype=np.int32).tofile(f)
         data.tofile(f)

     print(f"Generated {n_samples} samples of {n_dimensions}-dimensional data")
     ```
   - Run the script:
     ```
     python generate_data.py
     ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
/
├── app/
│   ├── components/
│   │   └── Visualiser.tsx
│   ├── lib/
│   │   └── dataLoader.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── data/
│       └── embeddings.bin
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Customisation

- To use your own embedding data, replace the `embeddings.bin` file in the `public/data/` directory.
- Adjust the visualisation parameters in `app/components/Visualiser.tsx` to suit your needs.

## Deployment

This app is designed to be easily deployed to Vercel. Simply connect your GitHub repository to Vercel, and it will automatically deploy your app with each push to the main branch.

For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Inspired by [TensorFlow Projector](https://projector.tensorflow.org/)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
