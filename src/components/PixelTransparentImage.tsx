import React, { useEffect, useState } from 'react';

interface PixelTransparentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const PixelTransparentImage: React.FC<PixelTransparentImageProps> = ({ src, ...props }) => {
  const [keyedSrc, setKeyedSrc] = useState<string>(src);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) return;
    setLoading(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setKeyedSrc(src);
        setLoading(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const width = canvas.width;
      const height = canvas.height;
      
      // Initialize visited array for BFS
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      // Sample a corner color (0, 0) as a background reference
      const cornerR = data[0];
      const cornerG = data[1];
      const cornerB = data[2];
      const cornerA = data[3];

      // Detect background type
      const isWhiteOrGrayBg = (cornerR > 140 && cornerG > 140 && cornerB > 140) || cornerA === 0;
      const isBlackBg = cornerR < 65 && cornerG < 65 && cornerB < 65 && cornerA > 50;

      // Check if a pixel matches the background to be transparentized
      const isMatch = (r: number, g: number, b: number, a: number) => {
        if (a < 30) return true; // Already transparent

        // ALWAYS key out bright white artifact blocks at the outer boundary
        const isArtifactWhite = r > 242 && g > 242 && b > 242;
        if (isArtifactWhite) return true;

        // Euclidean distance to corner background color
        const dist = Math.sqrt(
          Math.pow(r - cornerR, 2) +
          Math.pow(g - cornerG, 2) +
          Math.pow(b - cornerB, 2)
        );

        // Solid black backdrops require strict precision to preserve dark character clothing (boots, pants)
        if (isBlackBg) {
          if (dist < 18) return true;
        } else {
          if (dist < 48) return true;
        }

        // If white/gray checkered grid or solid white, key out any whites and light-grays
        if (isWhiteOrGrayBg) {
          const isWhite = r > 215 && g > 215 && b > 215;
          const isGray = r >= 140 && r <= 212 && g >= 140 && g <= 212 && b >= 140 && b <= 212;
          const isCheckeredWhite = r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8;
          if (isWhite || isGray || isCheckeredWhite) return true;
        }

        return false;
      };

      // Seed BFS queue with all pixels on the outer boundary of the image
      for (let x = 0; x < width; x++) {
        // Top Edge
        queue.push(x, 0);
        visited[x] = 1;
        // Bottom Edge
        queue.push(x, height - 1);
        visited[(height - 1) * width + x] = 1;
      }
      for (let y = 1; y < height - 1; y++) {
        // Left Edge
        queue.push(0, y);
        visited[y * width] = 1;
        // Right Edge
        queue.push(width - 1, y);
        visited[y * width + width - 1] = 1;
      }

      // Perform BFS flood fill starting from outer borders
      let head = 0;
      while (head < queue.length) {
        const x = queue[head++];
        const y = queue[head++];

        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (isMatch(r, g, b, a)) {
          // Wipe matching background pixel completely transparent
          data[idx + 3] = 0;

          // Enqueue adjacent neighbors
          const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (visited[nidx] === 0) {
                visited[nidx] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setKeyedSrc(canvas.toDataURL('image/png'));
      setLoading(false);
    };

    img.onerror = () => {
      setKeyedSrc(src);
      setLoading(false);
    };
  }, [src]);

  return (
    <img
      src={keyedSrc}
      className={props.className}
      alt={props.alt || 'Pixel Art Sprite'}
      referrerPolicy="no-referrer"
      style={{
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.15s ease-in-out',
        imageRendering: 'pixelated',
        ...props.style,
      }}
    />
  );
};
