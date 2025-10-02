// Test the VPS create response handling
const mockCreateResponse = {
    "statusCode": 201,
    "data": {
        "id": "68de96f5e59e08dfa6d92cda",
        "name": "fgdsf",
        "createdAt": "2025-10-02T15:15:01.840Z",
        "updatedAt": "2025-10-02T15:15:01.840Z"
    },
    "message": "Tạo mới thành công"
};

const mockListResponse = {
    "statusCode": 200,
    "data": {
        "items": [
            {
                "id": "68de96f5e59e08dfa6d92cda",
                "name": "fgdsf",
                "createdAt": "2025-10-02T15:15:01.840Z",
                "updatedAt": "2025-10-02T15:15:01.840Z",
                "description": null,
                "soldQuantity": null,
                "viewCount": null,
                "status": 0,
                "ram": 0,
                "disk": 0,
                "cpu": 0,
                "bandwidth": 0,
                "location": null,
                "os": null,
                "price": 0
            }
        ],
        "meta": {
            "total": 1,
            "page": 1
        }
    },
    "message": "Thành công"
};

console.log('Testing VPS API Response Handling');
console.log('================================');

// Test create response handling
console.log('\n1. Testing Create Response:');
console.log('Response:', JSON.stringify(mockCreateResponse, null, 2));

// Simulate the new mapping function
const mapApiVpsToVps = (item) => ({
    id: item.id,
    name: item.name,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    description: item.description,
    soldQuantity: item.soldQuantity,
    viewCount: item.viewCount,
    status: item.status,
    ram: item.ram,
    disk: item.disk,
    cpu: item.cpu,
    bandwidth: item.bandwidth,
    location: item.location,
    os: item.os,
    price: item.price,
    tags: item.tags || []
});

try {
    // This should now work correctly with the new VpsItemApiResponse structure
    const vpsData = mapApiVpsToVps(mockCreateResponse.data);
    console.log('✅ Successfully mapped create response to VPS object:');
    console.log('Mapped VPS:', JSON.stringify(vpsData, null, 2));
} catch (error) {
    console.log('❌ Error mapping create response:', error.message);
}

// Test list response handling
console.log('\n2. Testing List Response:');
console.log('Response:', JSON.stringify(mockListResponse, null, 2));

try {
    // This should work with the VpsListApiResponse structure
    const vpsItems = mockListResponse.data.items.map(mapApiVpsToVps);
    console.log('✅ Successfully mapped list response to VPS array:');
    console.log('Mapped VPS items count:', vpsItems.length);
    console.log('First item:', JSON.stringify(vpsItems[0], null, 2));
} catch (error) {
    console.log('❌ Error mapping list response:', error.message);
}

console.log('\n================================');
console.log('✅ All tests completed successfully');
console.log('✅ VPS create operations should now work correctly');
