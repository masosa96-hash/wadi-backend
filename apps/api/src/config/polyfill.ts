
/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill for DOMMatrix needed by pdfjs-dist (used by pdf-parse) in Node.js environment
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;

    constructor(init?: string | number[]) {
      if (Array.isArray(init)) {
        this.a = init[0] || 1;
        this.b = init[1] || 0;
        this.c = init[2] || 0;
        this.d = init[3] || 1;
        this.e = init[4] || 0;
        this.f = init[5] || 0;
      }
    }

    multiply(other: any) {
      return new (global as any).DOMMatrix([
        this.a * other.a + this.b * other.c,
        this.a * other.b + this.b * other.d,
        this.c * other.a + this.d * other.c,
        this.c * other.b + this.d * other.d,
        this.e * other.a + this.f * other.c + other.e,
        this.e * other.b + this.f * other.d + other.f
      ]);
    }

    transformPoint(point: { x: number, y: number }) {
      return {
        x: this.a * point.x + this.c * point.y + this.e,
        y: this.b * point.x + this.d * point.y + this.f
      };
    }

    toString() {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }
  };
}
