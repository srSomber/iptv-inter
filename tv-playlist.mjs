import https from 'https';
import http from 'http';

const BASE_URL = 'http://192.168.248.5';
const WATCH_URL = `${BASE_URL}/?tvwatch`;

async function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function generateTVPlaylist() {
  console.error('Fetching TV channel data...');
  const html = await fetch(WATCH_URL);

  const match = html.match(/var Streams\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find Streams data in the page');
    process.exit(1);
  }

  const streams = JSON.parse(match[1]);

  const m3uLines = ['#EXTM3U', `#PLAYLIST: TvPlay Canales (${streams.length} canales)`, ''];

  for (const ch of streams) {
    m3uLines.push(`#EXTINF:-1 tvg-id="${ch.m3u8}" tvg-name="${ch.name}" tvg-logo="${BASE_URL}/${ch.poster}",${ch.name}`);
    m3uLines.push(ch.url);
    m3uLines.push('');
  }

  const output = m3uLines.join('\n');
  process.stdout.write(output);
  console.error(`\n✓ Playlist generada: ${streams.length} canales`);
}

generateTVPlaylist().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
