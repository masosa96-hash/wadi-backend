import { KivoThought, WadiAction } from "./types";
/**
 * WADI: The Execution Engine
 * Takes Kivo's thoughts and executes actions.
 */
export declare function ejecutar(thought: KivoThought, _context?: any): Promise<WadiAction>;
