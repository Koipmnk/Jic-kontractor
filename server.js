/**
 * JIC KONTRACTOR — Database Server
 * ─────────────────────────────────────────────────────
 * CARA PAKAI:
 *   1. Taruh server.js dan index.html dalam satu folder
 *   2. Buka terminal di folder tersebut
 *   3. Jalankan: node server.js
 *   4. Buka browser: http://localhost:3000
 *
 * TIDAK butuh npm install apapun.
 * Data tersimpan permanen di: jic_database.json
 */

const http = require('http');
const fsm  = require('fs');
const path = require('path');
const urlm = require('url');

const PORT    = 3000;
const DB_FILE = path.join(__dirname, 'jic_database.json');
const HTML    = path.join(__dirname, 'index.html');

const DEFAULT_DB = {
  proyekData:[
    {id:1,nama:'Jalan Tol Semarang-Demak',lok:'Semarang, Jawa Tengah',status:'aktif',ang:18500,real:13300,prog:72,mulai:'2025-06-01',sel:'2026-12-31',ket:'Proyek jalan tol sepanjang 27km'},
    {id:2,nama:'Gedung Kantor Gubernur Jateng',lok:'Semarang, Jawa Tengah',status:'aktif',ang:12200,real:6700,prog:55,mulai:'2025-09-01',sel:'2026-11-30',ket:'Gedung 12 lantai + basement 2 lantai'},
    {id:3,nama:'Jembatan Sungai Brantas Malang',lok:'Malang, Jawa Timur',status:'aktif',ang:8400,real:7400,prog:88,mulai:'2025-04-01',sel:'2026-04-30',ket:'Jembatan bentang 120m'},
    {id:4,nama:'Rusunawa Surabaya Utara',lok:'Surabaya, Jawa Timur',status:'pending',ang:6100,real:1300,prog:22,mulai:'2026-01-15',sel:'2027-06-30',ket:'Rusunawa 6 tower, 200 unit/tower'},
    {id:5,nama:'Gedung Perkantoran Sudirman',lok:'Jakarta Pusat, DKI Jakarta',status:'selesai',ang:12800,real:12800,prog:100,mulai:'2024-03-01',sel:'2026-02-28',ket:'Gedung komersial 18 lantai'},
  ],
  pNextId:6,
  transData:[
    {id:1,tgl:'2026-03-03',desk:'Pembelian besi beton D16',proj:'Jembatan Sungai Brantas',kat:'Material',jenis:'Pengeluaran',jml:420000000,st:'Lunas',supplier:{},photos:[]},
    {id:2,tgl:'2026-03-02',desk:'Termin 3 PT Bina Graha',proj:'Jalan Tol Semarang-Demak',kat:'Sub-Kontraktor',jenis:'Pengeluaran',jml:1200000000,st:'Pending',supplier:{},photos:[]},
    {id:3,tgl:'2026-03-01',desk:'Progress billing termin 4',proj:'Gedung Kantor Gubernur Jateng',kat:'Pendapatan',jenis:'Pendapatan',jml:2800000000,st:'Lunas',supplier:{},photos:[]},
    {id:4,tgl:'2026-02-28',desk:'Upah mandor dan pekerja Feb',proj:'Jalan Tol Semarang-Demak',kat:'Tenaga Kerja',jenis:'Pengeluaran',jml:860000000,st:'Lunas',supplier:{},photos:[]},
    {id:5,tgl:'2026-02-27',desk:'Sewa alat berat crane 50T',proj:'Jembatan Sungai Brantas',kat:'Peralatan',jenis:'Pengeluaran',jml:185000000,st:'Lunas',supplier:{},photos:[]},
    {id:6,tgl:'2026-02-26',desk:'Final billing Gedung Sudirman',proj:'Gedung Sudirman Jakarta',kat:'Pendapatan',jenis:'Pendapatan',jml:4500000000,st:'Proses',supplier:{},photos:[]},
    {id:7,tgl:'2026-02-25',desk:'Semen 5000 zak PT Holcim',proj:'Rusunawa Surabaya Utara',kat:'Material',jenis:'Pengeluaran',jml:325000000,st:'Lunas',supplier:{},photos:[]},
  ],
  tNextId:8,
  invData:[
    {id:1,no:'INV-2026-001',proj:'Jalan Tol Semarang-Demak',tgl:'2026-02-15',jth:'2026-03-05',jml:1200000000,st:'Pending',ket:'Termin 3 pekerjaan tanah'},
    {id:2,no:'INV-2026-002',proj:'Gedung Kantor Gubernur Jateng',tgl:'2026-03-01',jth:'2026-03-31',jml:2800000000,st:'Lunas',ket:'Progress billing termin 4'},
    {id:3,no:'INV-2026-003',proj:'Gedung Sudirman Jakarta',tgl:'2026-02-26',jth:'2026-03-26',jml:4500000000,st:'Proses',ket:'Final billing completion'},
    {id:4,no:'INV-2026-004',proj:'Jembatan Sungai Brantas',tgl:'2026-03-03',jth:'2026-04-03',jml:750000000,st:'Pending',ket:'Termin 5 struktur atas'},
  ],
  iNextId:5,
  subkonData:[
    {id:1,nm:'PT Bina Graha',bid:'Pekerjaan Tanah',proj:'Jalan Tol Semarang-Demak',nil:3200000000,ter:'3/5',st:'aktif'},
    {id:2,nm:'CV Maju Bersama',bid:'Mekanikal Elektrikal',proj:'Gedung Kantor Gubernur Jateng',nil:1850000000,ter:'2/4',st:'aktif'},
    {id:3,nm:'PT Pondasi Utama',bid:'Pondasi dan Galian',proj:'Jembatan Sungai Brantas',nil:920000000,ter:'5/5',st:'selesai'},
  ],
  sNextId:4,
  rabData:{
    "0":[
      {id:1,ur:'Pekerjaan Persiapan dan Mobilisasi',kat:'Overhead',vol:1,sat:'ls',hrg:250000000,real:245000000},
      {id:2,ur:'Pekerjaan Tanah Cut and Fill',kat:'Material',vol:45000,sat:'m3',hrg:85000,real:89500},
      {id:3,ur:'Pekerjaan Pondasi Bored Pile',kat:'Material',vol:1200,sat:'m',hrg:1200000,real:1250000},
      {id:4,ur:'Pengadaan Aspal Hotmix',kat:'Material',vol:8500,sat:'ton',hrg:1800000,real:1850000},
      {id:5,ur:'Upah Pekerja Harian',kat:'Tenaga Kerja',vol:12,sat:'bulan',hrg:450000000,real:460000000},
      {id:6,ur:'Sewa Alat Berat',kat:'Peralatan',vol:12,sat:'bulan',hrg:380000000,real:420000000},
      {id:7,ur:'Sub-Kontraktor Tanah',kat:'Sub-Kontraktor',vol:1,sat:'paket',hrg:3200000000,real:3200000000}
    ],
    "1":[
      {id:10,ur:'Pekerjaan Pondasi Pile Cap',kat:'Material',vol:800,sat:'m3',hrg:2500000,real:2450000},
      {id:11,ur:'Pekerjaan Struktur Beton',kat:'Material',vol:5400,sat:'m3',hrg:3200000,real:3150000},
      {id:12,ur:'Upah Mandor dan Pekerja',kat:'Tenaga Kerja',vol:14,sat:'bulan',hrg:380000000,real:360000000}
    ],
    "2":[
      {id:20,ur:'Pekerjaan Pondasi Sumuran',kat:'Material',vol:200,sat:'unit',hrg:8500000,real:8800000},
      {id:21,ur:'Pekerjaan Gelagar Baja',kat:'Material',vol:180,sat:'ton',hrg:28000000,real:27500000}
    ],
    "3":[
      {id:30,ur:'Pekerjaan Persiapan Lahan',kat:'Overhead',vol:1,sat:'ls',hrg:180000000,real:175000000},
      {id:31,ur:'Pekerjaan Struktur Awal',kat:'Material',vol:1200,sat:'m3',hrg:2800000,real:2900000}
    ]
  },
  rNextId:50
};

function dbRead() {
  try {
    if (fsm.existsSync(DB_FILE)) return JSON.parse(fsm.readFileSync(DB_FILE, 'utf8'));
  } catch(e) { console.error('[DB] read error:', e.message); }
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}
function dbWrite(data) {
  try { fsm.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); return true; }
  catch(e) { console.error('[DB] write error:', e.message); return false; }
}

if (!fsm.existsSync(DB_FILE)) {
  dbWrite(DEFAULT_DB);
  console.log('[DB] Database baru dibuat:', DB_FILE);
} else {
  console.log('[DB] Database ditemukan:', DB_FILE);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, data, status) {
  status = status || 200;
  setCors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

http.createServer(async function(req, res) {
  const parsed = urlm.parse(req.url);
  const p = parsed.pathname;
  const m = req.method;

  if (m === 'OPTIONS') { setCors(res); res.writeHead(204); return res.end(); }

  console.log('[' + new Date().toLocaleTimeString('id-ID') + '] ' + m + ' ' + p);

  // Serve index.html
  if (m === 'GET' && p === '/') {
    try {
      const html = fsm.readFileSync(HTML, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch(e) {
      res.writeHead(404);
      return res.end('ERROR: index.html tidak ditemukan. Pastikan server.js dan index.html ada dalam satu folder.');
    }
  }

  // GET /api/db — load semua data
  if (m === 'GET' && p === '/api/db') return sendJson(res, dbRead());

  // POST /api/db — simpan semua data
  if (m === 'POST' && p === '/api/db') {
    try {
      const body = await readBody(req);
      const ok = dbWrite(body);
      return sendJson(res, { success: ok }, ok ? 200 : 500);
    } catch(e) {
      return sendJson(res, { success: false, error: e.message }, 400);
    }
  }

  // POST /api/reset — reset ke data default
  if (m === 'POST' && p === '/api/reset') {
    dbWrite(JSON.parse(JSON.stringify(DEFAULT_DB)));
    return sendJson(res, { success: true });
  }

  sendJson(res, { error: 'Not found' }, 404);

}).listen(PORT, '127.0.0.1', function() {
  console.log('');
  console.log('+-------------------------------------------------+');
  console.log('|     JIC KONTRACTOR  --  Database Server         |');
  console.log('+-------------------------------------------------+');
  console.log('|  Buka browser : http://localhost:3000           |');
  console.log('|  Database     : jic_database.json              |');
  console.log('|  Stop server  : tekan Ctrl+C                   |');
  console.log('+-------------------------------------------------+');
  console.log('');
});
