/**
 * Generic repository interface
 * Defines standard CRUD operations for any entity
 * Following the repository pattern for data access abstraction
 */
export interface IRepository<T> {
  /**
   * Create a new entity
   * @param item Entity to create
   * @returns Promise resolving to the created entity
   */
  create(item: T): Promise<T>;
  
  /**
   * Find entity by ID
   * @param id ID of the entity to find
   * @returns Promise resolving to the found entity or null if not found
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Find all entities matching the filter criteria
   * @param filter Filter criteria
   * @returns Promise resolving to an array of matching entities
   */
  findAll(filter?: object): Promise<T[]>;
  
  /**
   * Update an entity by ID
   * @param id ID of the entity to update
   * @param item Updated entity data
   * @returns Promise resolving to the updated entity or null if not found
   */
  update(id: string, item: Partial<T>): Promise<T | null>;
  
  /**
   * Delete an entity by ID
   * @param id ID of the entity to delete
   * @returns Promise resolving to true if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>;
}
