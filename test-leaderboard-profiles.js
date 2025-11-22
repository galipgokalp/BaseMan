#!/usr/bin/env node
/**
 * Leaderboard Profile Test Script
 * Tests if profile enrichment is working correctly
 */

const API_KEY = process.env.NEYNAR_API_KEY || 'D693D8F1-339A-44E2-A072-CC135AEB90DA';

async function testNeynarAPI() {
  console.log('🧪 Testing Neynar API...\n');
  
  // Test with a known Farcaster address (you can replace with a real one)
  const testAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
  
  try {
    const url = `https://api.neynar.com/v2/farcaster/user/by/verified_address?address=${encodeURIComponent(testAddress)}`;
    const response = await fetch(url, {
      headers: {
        'api_key': API_KEY,
        'x-api-key': API_KEY,
        'x-neynar-experimental': 'true',
        'accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('✅ API çalışıyor (404 = kullanıcı bulunamadı, bu normal)');
      return true;
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API çalışıyor!');
      console.log('Sample response:', JSON.stringify(data, null, 2).substring(0, 200));
      return true;
    }
    
    if (response.status === 401 || response.status === 402) {
      console.log('❌ API anahtarı geçersiz veya limit aşılmış');
      const text = await response.text();
      console.log('Error:', text);
      return false;
    }
    
    console.log(`⚠️  Unexpected status: ${response.status}`);
    return false;
  } catch (error) {
    console.error('❌ API test hatası:', error.message);
    return false;
  }
}

async function testLeaderboardAPI() {
  console.log('\n🧪 Testing Leaderboard API...\n');
  
  // Try local first, then production
  const baseUrls = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://base-man.vercel.app' // Replace with your actual Vercel URL
  ];
  
  for (const baseUrl of baseUrls) {
    try {
      const url = `${baseUrl}/api/leaderboard?limit=3`;
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Leaderboard API çalışıyor!');
        console.log(`Items count: ${data.items?.length || 0}`);
        
        if (data.items && data.items.length > 0) {
          const firstItem = data.items[0];
          console.log('\n📊 First item structure:');
          console.log(`  - Rank: ${firstItem.rank}`);
          console.log(`  - Player: ${firstItem.player}`);
          console.log(`  - Total Score: ${firstItem.totalScore}`);
          console.log(`  - Has Profile: ${!!firstItem.profile}`);
          
          if (firstItem.profile) {
            console.log('  ✅ Profile data exists!');
            console.log(`    - Username: ${firstItem.profile.username || 'N/A'}`);
            console.log(`    - Display Name: ${firstItem.profile.displayName || 'N/A'}`);
            console.log(`    - Avatar URL: ${firstItem.profile.avatarUrl ? 'Yes' : 'No'}`);
          } else {
            console.log('  ⚠️  Profile data missing');
            console.log('     Possible reasons:');
            console.log('     - NEYNAR_API_KEY not set in Vercel');
            console.log('     - LEADERBOARD_DISABLE_PROFILE_ENRICHMENT is enabled');
            console.log('     - Neynar API returned no profile for this address');
          }
        }
        
        return true;
      } else {
        console.log(`❌ HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      continue;
    }
  }
  
  return false;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Leaderboard Profile Enrichment Test');
  console.log('='.repeat(60));
  
  const apiTest = await testNeynarAPI();
  const leaderboardTest = await testLeaderboardAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));
  console.log(`Neynar API: ${apiTest ? '✅ Working' : '❌ Failed'}`);
  console.log(`Leaderboard API: ${leaderboardTest ? '✅ Working' : '❌ Failed'}`);
  
  if (apiTest && leaderboardTest) {
    console.log('\n✅ All tests passed! Profile enrichment should work.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

main().catch(console.error);

