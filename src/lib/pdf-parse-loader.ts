/**
 * Reliable pdf-parse module loader for Next.js API routes
 * Handles both CommonJS (require) and ESM (import) module systems
 */

// Type definitions for pdf-parse
interface PdfParseOptions {
  max?: number;
  version?: string;
  [key: string]: unknown;
}

interface PdfParseResult {
  numpages?: number;
  numPages?: number;
  numrender?: number;
  pages?: number | Array<unknown>;
  info?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  text?: string;
  version?: string;
  doc?: Record<string, unknown>;
}

type PdfParseFunction = (buffer: Buffer, options?: PdfParseOptions) => Promise<PdfParseResult>;

// Type for the pdf-parse module
type PdfParseModule = PdfParseFunction | {
  default?: PdfParseFunction | PdfParseClass;
  pdfParse?: PdfParseFunction | PdfParseClass;
  [key: string]: unknown;
};

// Type for a class constructor
interface PdfParseClass {
  new (buffer: Buffer, options?: PdfParseOptions): PdfParseResult | Promise<PdfParseResult> | {
    parse?: () => Promise<PdfParseResult>;
    numpages?: number;
    text?: string;
    info?: Record<string, unknown>;
    [key: string]: unknown;
  };
  parse?: (buffer: Buffer, options?: PdfParseOptions) => Promise<PdfParseResult>;
}

let pdfParseFunction: PdfParseFunction | null = null;

/**
 * Load pdf-parse module with multiple fallback strategies
 */
export async function loadPdfParse(): Promise<PdfParseFunction> {
  if (pdfParseFunction) {
    return pdfParseFunction;
  }

  let pdfParseModule: PdfParseModule | null = null;
  const errors: string[] = [];

  // Strategy 1: Try require() first (CommonJS - works in Node.js runtime)
  try {
    // Use Function constructor to avoid TypeScript compilation issues
    const requireFunc = new Function('moduleName', 'return require(moduleName)') as (moduleName: string) => PdfParseModule;
    pdfParseModule = requireFunc('pdf-parse');
    console.log("✅ Loaded pdf-parse via require()");
  } catch (requireError) {
    const errorMsg = requireError instanceof Error ? requireError.message : String(requireError);
    errors.push(`require() failed: ${errorMsg}`);
    console.log("⚠️ require() failed, trying import()...");
  }

  // Strategy 2: Try dynamic import() (ESM)
  if (!pdfParseModule) {
    try {
      pdfParseModule = await import("pdf-parse") as PdfParseModule;
      console.log("✅ Loaded pdf-parse via dynamic import()");
    } catch (importError) {
      const errorMsg = importError instanceof Error ? importError.message : String(importError);
      errors.push(`import() failed: ${errorMsg}`);
      console.error("❌ Dynamic import() also failed");
    }
  }

  if (!pdfParseModule) {
    throw new Error(
      `Failed to load pdf-parse module. Tried both require() and import(). Errors: ${errors.join('; ')}`
    );
  }

  // Helper function to check if something is a class constructor
  // This detects if a function requires 'new' to be called
  const isClass = (fn: unknown): fn is PdfParseClass => {
    if (typeof fn !== 'function') return false;
    
    // Check if it's an ES6 class by inspecting the string representation
    const str = fn.toString();
    if (/^\s*class\s/.test(str)) {
      return true;
    }
    
    // Try calling it - if it throws "cannot be invoked without 'new'", it's a class
    try {
      (fn as () => void)();
    } catch (e) {
      if (e instanceof TypeError && 
          (e.message.includes('cannot be invoked without \'new\'') ||
           e.message.includes('Class constructor') && e.message.includes('cannot be invoked'))) {
        return true;
      }
    }
    
    return false;
  };

  // Helper function to extract PDF data from pdf-parse instance
  // pdf-parse v2.4.3 is a class with getText() and getInfo() methods
  // We need to call these methods to get the parsed PDF data
  const extractPdfDataFromInstance = async (instance: Record<string, unknown>): Promise<PdfParseResult> => {
    // Check if instance has the parsed result directly (legacy format)
    if (instance.numpages !== undefined || instance.text !== undefined || instance.info !== undefined) {
      return {
        numpages: (instance.numpages as number) || (instance.numPages as number) || 1,
        numrender: (instance.numrender as number) || (instance.numRender as number) || 1,
        info: (instance.info as Record<string, unknown>) || {},
        metadata: (instance.metadata as Record<string, unknown> | null) || null,
        text: (instance.text as string) || '',
        version: ((instance.info as Record<string, unknown>)?.PDFFormatVersion as string) || '1.4',
      };
    }
    
    // pdf-parse v2.4.3: Call getText() and getInfo() methods
    let text = '';
    let numPages = 0;
    let info: Record<string, unknown> = {};
    let metadata: Record<string, unknown> | null = null;
    
    try {
      // Call getText() to extract text
      if (instance.getText && typeof instance.getText === 'function') {
        console.log("📝 Calling instance.getText()...");
        const textResult = await (instance.getText as () => Promise<{ text?: string; pages?: Array<{ text?: string }> }>)();
        if (textResult && typeof textResult === 'object') {
          // TextResult has a 'text' property with the full text
          if (typeof textResult.text === 'string') {
            text = textResult.text;
          }
          // It might also have a 'pages' array with per-page text
          if (textResult.pages && Array.isArray(textResult.pages)) {
            if (!text) {
              // Combine all page texts if we don't have full text
              text = textResult.pages
                .map(page => (page && typeof page === 'object' && typeof page.text === 'string' ? page.text : ''))
                .filter(t => t)
                .join('\n\n');
            }
            numPages = textResult.pages.length;
          }
        }
        console.log(`✅ Got text from getText(): ${text.length} characters, ${numPages} pages`);
      }
      
      // Call getInfo() to get metadata and page count
      if (instance.getInfo && typeof instance.getInfo === 'function') {
        console.log("📝 Calling instance.getInfo()...");
        const infoResult = await (instance.getInfo as () => Promise<{ 
          info?: Record<string, unknown>; 
          metadata?: Record<string, unknown>; 
          total?: number;
          numPages?: number;
          pageCount?: number;
        }>)();
        if (infoResult && typeof infoResult === 'object') {
          if (infoResult.info && typeof infoResult.info === 'object') {
            info = infoResult.info as Record<string, unknown>;
          }
          if (infoResult.metadata && typeof infoResult.metadata === 'object') {
            metadata = infoResult.metadata as Record<string, unknown>;
          }
          // Get page count from info - InfoResult uses 'total' for page count
          if (typeof infoResult.total === 'number') {
            numPages = infoResult.total;
          } else if (typeof infoResult.numPages === 'number') {
            numPages = infoResult.numPages;
          } else if (typeof infoResult.pageCount === 'number') {
            numPages = infoResult.pageCount;
          }
        }
        console.log(`✅ Got info: ${numPages} pages`);
      }
      
      // If we still don't have page count, estimate from text or use 1
      if (numPages === 0) {
        if (text && text.length > 0) {
          numPages = Math.max(1, Math.ceil(text.length / 2000));
          console.log(`📄 Estimated ${numPages} pages from text length`);
        } else {
          numPages = 1; // Default to 1 page
        }
      }
      
      // If we have text, return it even if page count is uncertain
      if (text || numPages > 0) {
        return {
          numpages: numPages,
          numPages: numPages,
          numrender: numPages,
          info: info,
          metadata: metadata,
          text: text,
          version: (info.PDFFormatVersion as string) || '1.4',
        };
      }
    } catch (error) {
      console.error("❌ Error calling getText() or getInfo():", error);
    }
    
    // Last resort: return minimal result
    console.warn("⚠️ Could not extract PDF data, returning minimal result");
    return {
      numpages: 1,
      numPages: 1,
      numrender: 1,
      info: {},
      metadata: null,
      text: '',
      version: '1.4',
    };
  };

  // Helper function to wrap a class constructor to work as a function
  // pdf-parse v2.4.3 is a class that needs to be instantiated and then
  // we call getText() and getInfo() methods to extract the PDF data
  const wrapClassAsFunction = (ClassConstructor: PdfParseClass): PdfParseFunction => {
    return async (buffer: Buffer): Promise<PdfParseResult> => {
      console.log("📝 pdf-parse detected as class, calling with 'new'");
      
      try {
        // Convert Buffer to Uint8Array - PDF.js requires Uint8Array, not Buffer
        // PDF.js checks for Buffer using instanceof and rejects it
        // We must create a new Uint8Array from the buffer data
        const uint8Array = new Uint8Array(buffer);
        console.log(`📦 Converted Buffer (${buffer.length} bytes) to Uint8Array (${uint8Array.length} bytes)`);
        
        // PDFParse constructor expects DocumentInitParameters: { data: Uint8Array | ArrayBuffer | ... }
        // Pass plain Uint8Array to avoid PDF.js rejecting Buffer
        const documentInitParams = {
          data: uint8Array,
        };
        
        console.log("📦 Creating PDFParse instance with DocumentInitParameters...");
        const instance = new ClassConstructor(documentInitParams as unknown as Buffer) as unknown as Record<string, unknown>;
        
        console.log("✅ Class instance created");
        console.log("📦 Instance keys:", Object.keys(instance));
        console.log("📦 Has getText:", typeof instance.getText === 'function');
        console.log("📦 Has getInfo:", typeof instance.getInfo === 'function');
        
        // Check if instance is a promise (shouldn't be, but check anyway)
        if (instance && 'then' in instance && typeof instance.then === 'function') {
          const result = await (instance as unknown as Promise<Record<string, unknown>>);
          return await extractPdfDataFromInstance(result);
        }
        
        // Extract PDF data from instance by calling getText() and getInfo()
        return await extractPdfDataFromInstance(instance);
      } catch (error) {
        console.error("❌ Error creating PDFParse instance:", error);
        console.error("❌ Error details:", error instanceof Error ? error.stack : String(error));
        throw new Error(
          `Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };
  };

  // Create a smart wrapper that handles both function and class cases
  const createSmartWrapper = (fn: PdfParseFunction | PdfParseClass): PdfParseFunction => {
    return async (buffer: Buffer, options?: PdfParseOptions): Promise<PdfParseResult> => {
      // First, try calling it as a function
      if (typeof fn === 'function' && !isClass(fn)) {
        try {
          return await (fn as PdfParseFunction)(buffer, options);
        } catch (e) {
          // If it fails with "cannot be invoked without 'new'", use the class wrapper
          if (e instanceof TypeError && e.message.includes('cannot be invoked without \'new\'')) {
            console.log("📝 Function call failed, using class instantiation");
            return await wrapClassAsFunction(fn as unknown as PdfParseClass)(buffer, options);
          }
          // Otherwise, re-throw the error
          throw e;
        }
      } else {
        // It's a class, use the class wrapper
        return await wrapClassAsFunction(fn as unknown as PdfParseClass)(buffer, options);
      }
    };
  };

  // Extract the function from the module
  // Try multiple possible export formats
  let candidate: PdfParseFunction | PdfParseClass | null = null;

  // Check if it's a direct function/class
  if (typeof pdfParseModule === 'function') {
    candidate = pdfParseModule as PdfParseFunction | PdfParseClass;
    console.log(`✅ Found pdf-parse as ${isClass(candidate) ? 'class' : 'function'} export`);
    // Always use smart wrapper to handle both cases
    pdfParseFunction = createSmartWrapper(candidate);
    return pdfParseFunction;
  }

  // Check default export
  if (pdfParseModule && typeof pdfParseModule === 'object' && 'default' in pdfParseModule) {
    const defaultExport = pdfParseModule.default;
    if (defaultExport && typeof defaultExport === 'function') {
      candidate = defaultExport as PdfParseFunction | PdfParseClass;
      console.log("✅ Found pdf-parse as default export");
      pdfParseFunction = createSmartWrapper(candidate);
      return pdfParseFunction;
    }
  }

  // Check named export
  if (pdfParseModule && typeof pdfParseModule === 'object' && 'pdfParse' in pdfParseModule) {
    const namedExport = pdfParseModule.pdfParse;
    if (namedExport && typeof namedExport === 'function') {
      candidate = namedExport as PdfParseFunction | PdfParseClass;
      console.log("✅ Found pdf-parse as named export");
      pdfParseFunction = createSmartWrapper(candidate);
      return pdfParseFunction;
    }
  }

  // Try to find any function/class in the module
  if (pdfParseModule && typeof pdfParseModule === 'object') {
    for (const key in pdfParseModule) {
      const value = pdfParseModule[key];
      if (value && typeof value === 'function') {
        candidate = value as PdfParseFunction | PdfParseClass;
        console.log(`✅ Found pdf-parse at key: ${key}`);
        pdfParseFunction = createSmartWrapper(candidate);
        return pdfParseFunction;
      }
    }
  }

  // Check __esModule wrapper
  if (pdfParseModule && typeof pdfParseModule === 'object' && '__esModule' in pdfParseModule && 'default' in pdfParseModule) {
    const defaultExport = pdfParseModule.default;
    if (defaultExport && typeof defaultExport === 'function') {
      candidate = defaultExport as PdfParseFunction | PdfParseClass;
      console.log("✅ Found pdf-parse via __esModule wrapper");
      pdfParseFunction = createSmartWrapper(candidate);
      return pdfParseFunction;
    }
  }

  throw new Error(
    `Could not find pdf-parse function in module. Module type: ${typeof pdfParseModule}, ` +
    `Keys: ${pdfParseModule ? Object.keys(pdfParseModule).join(', ') : 'null'}`
  );
}
