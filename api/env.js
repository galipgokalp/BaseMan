export default async function handler(req, res) {
  try {
    const entries = Object.entries(process.env || {}).filter(([k]) => k.startsWith('NEXT_PUBLIC_'));
    const obj = Object.fromEntries(entries);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send(`window.__ENV = ${JSON.stringify(obj)};`);
  } catch (err) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send('window.__ENV = {};');
  }
}

