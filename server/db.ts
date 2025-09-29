// Mock database implementation
export const db = {
  // This is a mock implementation to satisfy imports
  // All actual database operations are handled by the MockStorage class
  select: () => ({
    from: () => Promise.resolve([]),
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([]),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
  }),
  delete: () => ({
    where: () => ({
      rowCount: 0,
    }),
  }),
};

// Mock pool
export const pool = {
  connect: () => Promise.resolve({
    release: () => {},
  }),
};
