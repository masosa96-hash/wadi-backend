// Quick test to verify OpenAI integration
const http = require('http');

const testMessage = {
    message: "Dame un número del 1 al 10",
    messages: []
};

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-guest-id': 'test-' + Date.now()
    }
};

console.log('🧪 Testing WADI Chat Integration...\n');
console.log('Sending message:', testMessage.message);
console.log('');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('');

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:');
        console.log('─'.repeat(50));

        try {
            const parsed = JSON.parse(data);
            if (parsed.ok && parsed.data) {
                console.log('✅ SUCCESS!');
                console.log('');
                console.log('User Message:', testMessage.message);
                console.log('');
                console.log('WADI Response:', parsed.data.assistantMessage?.content || parsed.data.reply);
                console.log('');
                console.log('✅ OpenAI integration is working!');
            } else {
                console.log('❌ FAILED');
                console.log(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log('❌ ERROR parsing response');
            console.log(data);
        }

        console.log('─'.repeat(50));
    });
});

req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
    console.log('');
    console.log('Make sure backend is running: pnpm dev:api');
});

req.write(JSON.stringify(testMessage));
req.end();
