// Quick test to verify the buy request functionality
async function testBuyRequest() {
  try {
    const response = await fetch('http://localhost:4000/api/buy-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        contactNumber: '1234567890',
        email: 'test@example.com',
        bestTimeToCall: 'morning'
      })
    });

    const data = await response.json();
    console.log('API Response:', data);
    
    if (response.ok) {
      console.log('✅ Buy request submitted successfully!');
    } else {
      console.log('❌ Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testBuyRequest();
