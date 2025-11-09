import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: "key_4ca75ba8a083797ed67f51025e8f",
});

try {
  const response = await retellClient.call.list({
    sort_order: 'descending', // Get latest calls first
    limit: 10 // Number of calls to retrieve
  });
  console.log('Call initiated:', response);
} catch (error) {
  console.error('Error making call:', error);
}