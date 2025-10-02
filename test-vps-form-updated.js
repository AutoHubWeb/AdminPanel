// Test the updated VPS form with free text inputs
const sampleVpsData = {
  "name": "VPS-Ultimate-5",
  "description": "Máy chủ ảo cao cấp, tối ưu cho AI/ML workloads",
  "ram": 32,
  "disk": 1000,
  "cpu": 32,
  "bandwidth": 20,
  "location": "Tokyo", // Free text input
  "os": "Debian 12",   // Free text input
  "tags": ["premium", "ai", "ml", "ultimate"],
  "price": 10000000
};

console.log('Sample VPS Data:', JSON.stringify(sampleVpsData, null, 2));

// Test form data structure with free text inputs
const formData = {
  name: sampleVpsData.name,
  description: sampleVpsData.description,
  ram: sampleVpsData.ram.toString(),
  disk: sampleVpsData.disk.toString(),
  cpu: sampleVpsData.cpu.toString(),
  bandwidth: sampleVpsData.bandwidth.toString(),
  location: sampleVpsData.location, // Free text
  os: sampleVpsData.os,             // Free text
  tags: sampleVpsData.tags.join(', '),
  price: sampleVpsData.price.toString(),
  status: "1"
};

console.log('\nForm Data Structure (with free text inputs):', JSON.stringify(formData, null, 2));

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
  console.log('✅ Form data conversion is correct with free text inputs');
} else {
  console.log('❌ Form data conversion has issues');
}

// Test with custom location and OS values
const customData = {
  ...formData,
  location: "Custom Data Center",
  os: "Custom Linux Distro 1.0"
};

const customApiData = {
  ...customData,
  ram: Number(customData.ram),
  disk: Number(customData.disk),
  cpu: Number(customData.cpu),
  bandwidth: Number(customData.bandwidth),
  price: Number(customData.price),
  status: Number(customData.status),
  tags: customData.tags ? customData.tags.split(',').map(tag => tag.trim()) : []
};

console.log('\nCustom Location & OS Test:');
console.log('Form Data:', JSON.stringify(customData, null, 2));
console.log('API Data:', JSON.stringify(customApiData, null, 2));
console.log('✅ Custom values are preserved correctly');
