// Simple test to verify city filtering logic
// This demonstrates the expected behavior

console.log("Testing city filtering logic...");

// Test helper function
const filterValue = (val) => {
  if (val === undefined || val === null || val === '' || val === 'any') return undefined;
  return val;
};

// Test cases
const testCases = [
  { city: "New York", expected: true },
  { city: "new york", expected: true }, // Should work with case insensitive
  { city: "york", expected: true }, // Should work with partial match
  { city: "", expected: false },
  { city: "any", expected: false },
  { city: undefined, expected: false },
];

console.log("Testing filterValue function:");
testCases.forEach(test => {
  const result = filterValue(test.city);
  const passed = (result !== undefined) === test.expected;
  console.log(`City: "${test.city}" -> ${result} (${passed ? 'PASS' : 'FAIL'})`);
});

// Test building where conditions
function buildWhereConditions(query) {
  const whereConditions = {};
  
  // City filter with partial matching (case-insensitive)
  const cityFilter = filterValue(query.city);
  if (cityFilter) {
    whereConditions.city = {
      contains: cityFilter,
      mode: 'insensitive'
    };
  }
  
  // Type filter
  const typeFilter = filterValue(query.type);
  if (typeFilter) {
    whereConditions.type = typeFilter;
  }
  
  return whereConditions;
}

console.log("\nTesting where conditions:");
console.log("Query with only city:", JSON.stringify(buildWhereConditions({ city: "New York" }), null, 2));
console.log("Query with city and type:", JSON.stringify(buildWhereConditions({ city: "Los Angeles", type: "buy" }), null, 2));
console.log("Query with empty filters:", JSON.stringify(buildWhereConditions({ city: "", type: "" }), null, 2));
