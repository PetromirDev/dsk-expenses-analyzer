/**
 * Bank adapter registry
 * Manages all available bank adapters and routes XML to the correct parser
 */

import type { BankAdapter } from '../types/banking'
import { dskAdapter } from './banks/dsk'

/**
 * Registry of all supported bank adapters
 */
class BankAdapterRegistry {
  private adapters: BankAdapter[] = []

  constructor() {
    // Register all available adapters
    this.register(dskAdapter)
  }

  /**
   * Register a new bank adapter
   */
  register(adapter: BankAdapter): void {
    this.adapters.push(adapter)
  }

  /**
   * Find the appropriate adapter for given XML content
   */
  findAdapter(xmlContent: string): BankAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(xmlContent)) {
        return adapter
      }
    }
    return null
  }

  /**
   * Get all registered adapters
   */
  getAll(): BankAdapter[] {
    return [...this.adapters]
  }

  /**
   * Get adapter by bank ID
   */
  getById(bankId: string): BankAdapter | undefined {
    return this.adapters.find((a) => a.bankId === bankId)
  }
}

/**
 * Export singleton instance
 */
export const bankRegistry = new BankAdapterRegistry()
