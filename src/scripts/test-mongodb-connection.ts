import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb';

async function runDiagnostic() {
  console.log('\n======================================================================');
  console.log('  RideSetu — STEP 9: MongoDB Atlas TLS / Network Diagnostic          ');
  console.log('======================================================================\n');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  // Safely extract hostname without credentials
  const match = uri.match(/@([^/?]+)/);
  const clusterHost = match ? match[1] : null;

  if (!clusterHost) {
    console.error('❌ Unable to parse cluster host from MONGODB_URI.');
    process.exit(1);
  }

  console.log('--- 1. Testing DNS Resolution ---');
  let dnsPassed = false;
  let resolvedIp = '';
  let srvTargetHost = clusterHost;
  try {
    if (uri.startsWith('mongodb+srv://')) {
      const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${clusterHost}`);
      if (srvRecords && srvRecords.length > 0) {
        dnsPassed = true;
        srvTargetHost = srvRecords[0].name;
        const addresses = await dns.promises.lookup(srvTargetHost);
        resolvedIp = addresses.address;
      }
    } else {
      const addresses = await dns.promises.lookup(clusterHost);
      if (addresses && addresses.address) {
        dnsPassed = true;
        resolvedIp = addresses.address;
      }
    }
  } catch (err: any) {
    console.error('  DNS Lookup Error:', err.message);
  }
  console.log(`  DNS Resolution: ${dnsPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  console.log('\n--- 2. Testing TCP Connectivity (Port 27017) ---');
  let tcpPassed = false;
  if (resolvedIp) {
    tcpPassed = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ host: resolvedIp, port: 27017, timeout: 5000 }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }
  console.log(`  TCP Port 27017: ${tcpPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  console.log('\n--- 3. Testing TLS Handshake ---');
  let tlsPassed = false;
  if (resolvedIp) {
    tlsPassed = await new Promise<boolean>((resolve) => {
      const socket = tls.connect(
        { host: resolvedIp, port: 27017, servername: srvTargetHost, timeout: 5000, rejectUnauthorized: true },
        () => {
          socket.destroy();
          resolve(true);
        }
      );
      socket.on('error', (err) => {
        console.error('  TLS Error:', err.message);
        resolve(false);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }
  console.log(`  TLS Handshake: ${tlsPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  console.log('\n--- 4. Testing Mongoose Connection & Database Ping ---');
  let serverSelectionPassed = false;
  let pingPassed = false;
  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection && conn.connection.readyState === 1) {
      serverSelectionPassed = true;
      if (conn.connection.db) {
        const pingResult = await conn.connection.db.admin().ping();
        if (pingResult && pingResult.ok === 1) {
          pingPassed = true;
        }
      }
    }
  } catch (err: any) {
    console.error('  Mongoose Error:', err.message);
  }

  console.log(`  Mongoose Server Selection: ${serverSelectionPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);
  console.log(`  Database Admin Ping: ${pingPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  console.log('\n======================================================================');
  const allPassed = dnsPassed && tcpPassed && tlsPassed && serverSelectionPassed && pingPassed;
  console.log(`  MongoDB Connection Diagnostic: ${allPassed ? 'ALL PASSED (100%)' : 'ISSUES DETECTED'}`);
  console.log('======================================================================\n');

  if (allPassed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDiagnostic();
