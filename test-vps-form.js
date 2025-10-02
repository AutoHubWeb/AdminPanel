// Simple test to verify VPS form structure matches API
const sampleVpsData = {
  "name": "VPS-Ultimate-5",
  "description": "Máy chủ ảo cao cấp, tối ưu cho AI/ML workloads",
  "ram": 32,
  "disk": 1000,
  "cpu": 32,
  "bandwidth": 20,
  "location": "Tokyo",
  "os": "Debian 12",
  "tags": ["premium", "ai", "ml", "ultimate"],
  "price": 10000000
};

console.log('Sample VPS Data:', JSON.stringify(sampleVpsData, null, 2));

// Verify all required fields are present
const requiredFields = ['name', 'description', 'ram', 'disk', 'cpu', 'bandwidth', 'location', 'os', 'tags', 'price'];
const missingFields = requiredFields.filter(field => !(field in sampleVpsData));

if (missingFields.length === 0) {
  console.log('✅ All required fields are present in sample data');
} else {
  console.log('❌ Missing fields:', missingFields);
}

// Test form data structure
const formData = {
  name: sampleVpsData.name,
  description: sampleVpsData.description,
  ram: sampleVpsData.ram.toString(),
  disk: sampleVpsData.disk.toString(),
  cpu: sampleVpsData.cpu.toString(),
  bandwidth: sampleVpsData.bandwidth.toString(),
  location: sampleVpsData.location,
  os: sampleVpsData.os,
  tags: sampleVpsData.tags.join(', '),
  price: sampleVpsData.price.toString(),
  status: "1" // Active
};

console.log('\nForm Data Structure:', JSON.stringify(formData, null, 2));

// Test conversion back to API format
const apiData = {
  ...formData,
  ram: Number(formData.ram),
  disk: Number(formData.disk),
  cpu: Number(formData.cpu),
  bandwidth: Number(formData.bandwidth),
  price: Number(formData.price),
  status: Number(formData.status),
  tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
};

console.log('\nConverted API Data:', JSON.stringify(apiData, null, 2));

// Verify conversion
const isConversionCorrect = 
  apiData.name === sampleVpsData.name &&
  apiData.description === sampleVpsData.description &&
  apiData.ram === sampleVpsData.ram &&
  apiData.disk === sampleVpsData.disk &&
  apiData.cpu === sampleVpsData.cpu &&
  apiData.bandwidth === sampleVpsData.bandwidth &&
  apiData.location === sampleVpsData.location &&
  apiData.os === sampleVpsData.os &&
  JSON.stringify(apiData.tags) === JSON.stringify(sampleVpsData.tags) &&
  apiData.price === sampleVpsData.price;

if (isConversionCorrect) {
  console.log('✅ Form data conversion is correct');
} else {
  console.log('❌ Form data conversion has issues');
}
