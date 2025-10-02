// Simple test script to verify VPS display integration
async function testVpsDisplay() {
  try {
    const response = await fetch('https://shopnro.hitly.click/api/v1/vps');
    const data = await response.json();
    console.log('VPS API Response:', JSON.stringify(data, null, 2));
    
    // Check if the response has the expected structure
    if (data.statusCode === 200 && data.data && data.data.items) {
      console.log('✅ API integration successful!');
      console.log(`Found ${data.data.items.length} VPS items`);
      
      // Check the first item for all expected fields
      if (data.data.items.length > 0) {
        const firstItem = data.data.items[0];
        console.log('\n--- First VPS Item Details ---');
        console.log('ID:', firstItem.id);
        console.log('Name:', firstItem.name);
        console.log('Created At:', firstItem.createdAt);
        console.log('Updated At:', firstItem.updatedAt);
        console.log('Description:', firstItem.description || 'N/A');
        console.log('Sold Quantity:', firstItem.soldQuantity);
        console.log('View Count:', firstItem.viewCount);
        console.log('Status:', firstItem.status);
        console.log('RAM:', firstItem.ram, 'GB');
        console.log('Disk:', firstItem.disk, 'GB');
        console.log('CPU:', firstItem.cpu, 'cores');
        console.log('Bandwidth:', firstItem.bandwidth, 'GB/tháng');
        console.log('Location:', firstItem.location || 'N/A');
        console.log('OS:', firstItem.os || 'N/A');
        console.log('Price:', firstItem.price);
        console.log('Tags:', firstItem.tags ? firstItem.tags.join(', ') : 'N/A');
        
        // Verify all required fields are present
        const requiredFields = ['id', 'name', 'createdAt', 'updatedAt', 'status', 'ram', 'disk', 'cpu', 'bandwidth', 'price'];
        const missingFields = requiredFields.filter(field => !(field in firstItem));
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields are present');
        } else {
          console.log('❌ Missing fields:', missingFields);
        }
      }
    } else {
      console.log('❌ Unexpected API response structure');
    }
  } catch (error) {
    console.error('❌ Error testing VPS API:', error);
  }
}

testVpsDisplay();
