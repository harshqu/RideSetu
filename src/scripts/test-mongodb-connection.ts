import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb';
import { User } from '../models/User';

async function runDiagnostic() {
  console.log('\n======================================================================');
  console.log('  RideSetu — STEP 9.2: MongoDB Atlas 9-Layer Root Cause Diagnostic  ');
  console.log('======================================================================\n');

  const uri = process.env.MONGODB_URI;

  // [1] MONGODB_URI PRESENT
  const uriPresent = !!uri && uri.length > 0;
  console.log(`[1] MONGODB_URI PRESENT: ${uriPresent ? '✅ [PASS]' : '❌ [FAIL]'}`);

  if (!uriPresent) {
    console.error('\nSTOP: MONGODB_URI IS NOT CONFIGURED');
    process.exit(1);
  }

  // [2] URI FORMAT
  const isSrv = uri.startsWith('mongodb+srv://');
  const isStandard = uri.startsWith('mongodb://');
  const uriFormatValid = isSrv || isStandard;
  console.log(`[2] URI FORMAT: ${uriFormatValid ? `✅ [PASS] (${isSrv ? 'mongodb+srv://' : 'mongodb://'})` : '❌ [FAIL]'}`);

  // Safely extract hostname without credentials
  const match = uri.match(/@([^/?]+)/);
  const clusterHost = match ? match[1] : null;

  if (!clusterHost) {
    console.error('❌ Unable to parse cluster host from MONGODB_URI (Check for unencoded special characters in password)');
    console.log('[3] DNS / SRV RESOLUTION: ❌ [FAIL]');
    console.log('[4] TCP CONNECTION: ❌ [FAIL]');
    console.log('[5] TLS HANDSHAKE: ❌ [FAIL]');
    console.log('[6] MONGODB SERVER SELECTION: ❌ [FAIL]');
    console.log('[7] MONGODB PING: ❌ [FAIL]');
    console.log('[8] MONGOOSE CONNECTION: ❌ [FAIL]');
    console.log('[9] USER COLLECTION ACCESS: ❌ [FAIL]');
    process.exit(1);
  }

  // [3] DNS / SRV RESOLUTION
  let dnsPassed = false;
  let resolvedIp = '';
  let srvTargetHost = clusterHost;
  try {
    if (isSrv) {
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
  console.log(`[3] DNS / SRV RESOLUTION: ${dnsPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  // [4] TCP CONNECTION
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
  console.log(`[4] TCP CONNECTION: ${tcpPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  // [5] TLS HANDSHAKE
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
        console.error('  TLS Error Detail:', err.message);
        resolve(false);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }
  console.log(`[5] TLS HANDSHAKE: ${tlsPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  // [6] MONGODB SERVER SELECTION, [7] MONGODB PING, [8] MONGOOSE CONNECTION, [9] USER COLLECTION ACCESS
  let serverSelectionPassed = false;
  let pingPassed = false;
  let mongooseConnPassed = false;
  let userCollectionPassed = false;

  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection && conn.connection.readyState === 1) {
      mongooseConnPassed = true;
      serverSelectionPassed = true;
      if (conn.connection.db) {
        const pingResult = await conn.connection.db.admin().ping();
        if (pingResult && pingResult.ok === 1) {
          pingPassed = true;
        }

        const userCount = await User.countDocuments();
        if (typeof userCount === 'number') {
          userCollectionPassed = true;
        }
      }
    }
  } catch (err: any) {
    console.error('  Mongoose Connection Error Detail:', err.message);
  }

  console.log(`[6] MONGODB SERVER SELECTION: ${serverSelectionPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);
  console.log(`[7] MONGODB PING: ${pingPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);
  console.log(`[8] MONGOOSE CONNECTION: ${mongooseConnPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);
  console.log(`[9] USER COLLECTION ACCESS: ${userCollectionPassed ? '✅ [PASS]' : '❌ [FAIL]'}`);

  console.log('\n======================================================================');
  const allPassed = uriPresent && uriFormatValid && dnsPassed && tcpPassed && tlsPassed && serverSelectionPassed && pingPassed && mongooseConnPassed && userCollectionPassed;
  console.log(`  Diagnostic Summary: ${allPassed ? 'ALL 9 LAYERS PASSED (100%)' : 'FAILURE DETECTED'}`);
  console.log('======================================================================\n');

  if (allPassed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDiagnostic();
