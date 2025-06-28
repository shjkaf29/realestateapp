// Quick test script to check API responses
const fetch = require('node-fetch');

async function testAPI() {
  try {
    // Test 1: Get all posts
    console.log('=== Testing: Get all posts ===');
    const allPostsResponse = await fetch('http://localhost:8800/api/posts');
    const allPosts = await allPostsResponse.json();
    console.log(`Total posts: ${allPosts.length}`);
    
    if (allPosts.length > 0) {
      console.log('Sample cities in database:');
      const cities = [...new Set(allPosts.map(post => post.city))];
      console.log(cities);
    }

    // Test 2: Search for "ipoh"
    console.log('\n=== Testing: Search for "ipoh" ===');
    const ipohResponse = await fetch('http://localhost:8800/api/posts?city=ipoh');
    const ipohPosts = await ipohResponse.json();
    console.log(`Posts with "ipoh": ${ipohPosts.length}`);
    if (ipohPosts.length > 0) {
      console.log('Found posts:');
      ipohPosts.forEach(post => console.log(`- ${post.title} in ${post.city}`));
    }

    // Test 3: Search for "Ipoh" (capitalized)
    console.log('\n=== Testing: Search for "Ipoh" (capitalized) ===');
    const ipohCapResponse = await fetch('http://localhost:8800/api/posts?city=Ipoh');
    const ipohCapPosts = await ipohCapResponse.json();
    console.log(`Posts with "Ipoh": ${ipohCapPosts.length}`);
    if (ipohCapPosts.length > 0) {
      console.log('Found posts:');
      ipohCapPosts.forEach(post => console.log(`- ${post.title} in ${post.city}`));
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('Make sure the API server is running on port 8800');
  }
}

testAPI();
