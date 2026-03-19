#!/usr/bin/env node
// Azimute Tweet Script — OAuth 1.0a
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

// Load credentials
const envPath = process.env.TWITTER_ENV || `${process.env.HOME}/.openclaw/secrets/twitter.env`;
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const API_KEY = env.TWITTER_API_KEY;
const API_SECRET = env.TWITTER_API_SECRET;
const ACCESS_TOKEN = env.TWITTER_ACCESS_TOKEN;
const ACCESS_SECRET = env.TWITTER_ACCESS_TOKEN_SECRET;

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function sign(method, url, params) {
  const baseStr = [method.toUpperCase(), percentEncode(url),
    percentEncode(Object.keys(params).sort().map(k => `${k}=${percentEncode(params[k])}`).join('&'))
  ].join('&');
  const signingKey = `${percentEncode(API_SECRET)}&${percentEncode(ACCESS_SECRET)}`;
  return crypto.createHmac('sha1', signingKey).update(baseStr).digest('base64');
}

function tweet(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.x.com/2/tweets';
    const oauthParams = {
      oauth_consumer_key: API_KEY,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: ACCESS_TOKEN,
      oauth_version: '1.0'
    };
    oauthParams.oauth_signature = sign('POST', url, oauthParams);
    const authHeader = 'OAuth ' + Object.keys(oauthParams).sort()
      .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ');

    const body = JSON.stringify({ text });
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const text = process.argv.slice(2).join(' ');
if (!text) { console.error('Usage: node tweet.js "your tweet"'); process.exit(1); }
tweet(text).then(r => { console.log(JSON.stringify(r, null, 2)); }).catch(e => { console.error(e.message); process.exit(1); });
