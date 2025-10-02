// Simple test script to verify VPS API integration
async function testVpsApi() {
  try {
    const response = await fetch('https://shopnro.hitly.click/api/v1/vps');
    const data = await response.json();
    console.log('VPS API Response:', JSON.stringify(data, null, 2));
    
    // Check if the response has the expected structure
    if (data.statusCode === 200 && data.data && data.data.items) {
      console.log('✅ API integration successful!');
      console.log(`Found ${data.data.items.length} VPS items`);
      
      // Log the first item as an example
      if (data.data.items.length > 0) {
        console.log('First VPS item:', JSON.stringify(data.data.items[0], null, 2));
      }
    } else {
      console.log('❌ Unexpected API response structure');
    }
  } catch (error) {
    console.error('❌ Error testing VPS API:', error);
  }
}

testVpsApi();
