/**
 * DOM polyfills for serverless environments
 * Required for pdf-parse to work in Vercel/serverless environments
 */

// Set up polyfills for serverless/Node.js environments
const setupPolyfills = () => {
  // Get the global object (works in both Node.js and browser)
  const globalObj = typeof globalThis !== 'undefined' ? globalThis : 
                    typeof global !== 'undefined' ? global : 
                    typeof window !== 'undefined' ? window : {};
  
  // Only set up if we don't already have these (browser has them, Node.js doesn't)
  if (typeof window === 'undefined') {
  // Polyfill DOMMatrix
  if (typeof (globalObj as any).DOMMatrix === 'undefined') {
    (globalObj as any).DOMMatrix = class DOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;
      m11 = 1;
      m12 = 0;
      m13 = 0;
      m14 = 0;
      m21 = 0;
      m22 = 1;
      m23 = 0;
      m24 = 0;
      m31 = 0;
      m32 = 0;
      m33 = 1;
      m34 = 0;
      m41 = 0;
      m42 = 0;
      m43 = 0;
      m44 = 1;
      
      constructor(init?: string | number[]) {
        if (init) {
          if (typeof init === 'string') {
            // Parse matrix string
            const values = init.match(/[\d.]+/g)?.map(Number) || [];
            if (values.length >= 6) {
              this.a = values[0];
              this.b = values[1];
              this.c = values[2];
              this.d = values[3];
              this.e = values[4];
              this.f = values[5];
            }
          } else if (Array.isArray(init) && init.length >= 6) {
            this.a = init[0];
            this.b = init[1];
            this.c = init[2];
            this.d = init[3];
            this.e = init[4];
            this.f = init[5];
          }
        }
      }
      
      multiply(other: DOMMatrix): DOMMatrix {
        const result = new DOMMatrix();
        result.a = this.a * other.a + this.c * other.b;
        result.b = this.b * other.a + this.d * other.b;
        result.c = this.a * other.c + this.c * other.d;
        result.d = this.b * other.c + this.d * other.d;
        result.e = this.a * other.e + this.c * other.f + this.e;
        result.f = this.b * other.e + this.d * other.f + this.f;
        return result;
      }
      
      translate(x: number, y: number): DOMMatrix {
        const translate = new DOMMatrix([1, 0, 0, 1, x, y]);
        return this.multiply(translate);
      }
      
      scale(x: number, y?: number): DOMMatrix {
        const scaleY = y !== undefined ? y : x;
        const scale = new DOMMatrix([x, 0, 0, scaleY, 0, 0]);
        return this.multiply(scale);
      }
    } as unknown as typeof DOMMatrix;
  }

  // Polyfill ImageData
  if (typeof (globalObj as any).ImageData === 'undefined') {
    (globalObj as any).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
        if (dataOrWidth instanceof Uint8ClampedArray) {
          this.data = dataOrWidth;
          this.width = widthOrHeight || 0;
          this.height = height || 0;
        } else {
          this.width = dataOrWidth;
          this.height = widthOrHeight || 0;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        }
      }
    } as unknown as typeof ImageData;
  }

  // Polyfill Path2D
  if (typeof (globalObj as any).Path2D === 'undefined') {
    (globalObj as any).Path2D = class Path2D {
      constructor(path?: string | Path2D) {
        // Minimal implementation
      }
      
      addPath(path: Path2D, transform?: DOMMatrix): void {
        // Minimal implementation
      }
      
      arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
        // Minimal implementation
      }
      
      arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
        // Minimal implementation
      }
      
      bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
        // Minimal implementation
      }
      
      closePath(): void {
        // Minimal implementation
      }
      
      ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
        // Minimal implementation
      }
      
      lineTo(x: number, y: number): void {
        // Minimal implementation
      }
      
      moveTo(x: number, y: number): void {
        // Minimal implementation
      }
      
      quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        // Minimal implementation
      }
      
      rect(x: number, y: number, w: number, h: number): void {
        // Minimal implementation
      }
    } as unknown as typeof Path2D;
  }
  }
};

// Call setup immediately when module loads
setupPolyfills();

