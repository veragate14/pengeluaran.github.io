import { Transaction } from '../types/finance';

const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a brand new Google Sheet specifically formatted for CatatKas
 */
export async function createFinanceSpreadsheet(
  accessToken: string,
  title: string = 'CatatKas - Catatan Keuangan Pribadi'
): Promise<SheetCreationResult> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Transaksi',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Ringkasan Bulanan',
        },
      },
    ],
  };

  const response = await fetch(SHEETS_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat Google Sheet: ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Initialize Header Row in 'Transaksi'
  const headers = [
    [
      'ID Transaksi',
      'Tanggal',
      'Waktu',
      'Tipe (Pemasukan / Pengeluaran)',
      'Kategori',
      'Nominal (Rp)',
      'Dompet / Akun',
      'Catatan / Keterangan',
      'Waktu Input Sistem',
    ],
  ];

  await fetch(`${SHEETS_BASE_URL}/${spreadsheetId}/values/Transaksi!A1:I1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: headers,
    }),
  });

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Appends a single transaction to the Google Sheet
 */
export async function appendTransactionToSheet(
  accessToken: string,
  spreadsheetId: string,
  tx: Transaction
): Promise<void> {
  const row = [
    tx.id,
    tx.date,
    tx.time,
    tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    tx.category,
    tx.amount,
    tx.wallet,
    tx.description || '-',
    new Date(tx.createdAt).toLocaleString('id-ID'),
  ];

  const response = await fetch(
    `${SHEETS_BASE_URL}/${spreadsheetId}/values/Transaksi!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menambahkan baris ke Google Sheet: ${errText}`);
  }
}

/**
 * Reads all transaction records from the Google Sheet
 */
export async function readTransactionsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Transaction[]> {
  const response = await fetch(
    `${SHEETS_BASE_URL}/${spreadsheetId}/values/Transaksi!A2:I5000`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal membaca data dari Google Sheet: ${errText}`);
  }

  const data = await response.json();
  const rows: any[][] = data.values || [];

  const transactions: Transaction[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;

    const id = row[0] || `tx-${Date.now()}-${i}`;
    const date = row[1] || '';
    const time = row[2] || '12:00';
    const typeStr = (row[3] || '').toLowerCase();
    const type = typeStr.includes('pemasukan') || typeStr === 'income' ? 'income' : 'expense';
    const category = (row[4] || 'Lainnya') as any;
    
    // Clean amount if it contains "Rp", commas, or dots
    let amount = 0;
    if (typeof row[5] === 'number') {
      amount = row[5];
    } else if (typeof row[5] === 'string') {
      const cleaned = row[5].replace(/[^0-9.-]/g, '');
      amount = parseFloat(cleaned) || 0;
    }

    const wallet = (row[6] || 'Rekening Bank') as any;
    const description = row[7] || '';
    const createdAt = row[8] ? new Date(row[8]).getTime() || Date.now() : Date.now();

    if (amount > 0 && date) {
      transactions.push({
        id,
        date,
        time,
        type,
        category,
        amount,
        wallet,
        description,
        sheetRowIndex: i + 2,
        createdAt,
      });
    }
  }

  return transactions;
}

/**
 * Overwrites / Syncs all transactions and the Summary sheet with current state
 */
export async function syncAllTransactionsToSheet(
  accessToken: string,
  spreadsheetId: string,
  transactions: Transaction[],
  startingBalance: number
): Promise<void> {
  // 1. Clear old data from Transaksi sheet from row 2 onwards
  await fetch(`${SHEETS_BASE_URL}/${spreadsheetId}/values/Transaksi!A2:I5000:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // 2. Prepare header + all rows
  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Waktu',
    'Tipe (Pemasukan / Pengeluaran)',
    'Kategori',
    'Nominal (Rp)',
    'Dompet / Akun',
    'Catatan / Keterangan',
    'Waktu Input Sistem',
  ];

  const rows = transactions.map((tx) => [
    tx.id,
    tx.date,
    tx.time,
    tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    tx.category,
    tx.amount,
    tx.wallet,
    tx.description || '-',
    new Date(tx.createdAt).toLocaleString('id-ID'),
  ]);

  const allValues = [headers, ...rows];

  await fetch(`${SHEETS_BASE_URL}/${spreadsheetId}/values/Transaksi!A1:I${allValues.length}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: allValues,
    }),
  });

  // 3. Update 'Ringkasan Bulanan' tab
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = startingBalance + totalIncome - totalExpense;

  const summaryValues = [
    ['RINGKASAN KEUANGAN PRIBADI (CATATKAS)', ''],
    ['Terakhir Diperbarui', new Date().toLocaleString('id-ID')],
    ['', ''],
    ['Posisi Dana', 'Nominal (Rp)'],
    ['Dana / Saldo Awal Bulan Ini', startingBalance],
    ['Total Pemasukan Tercatat', totalIncome],
    ['Total Pengeluaran Tercatat', totalExpense],
    ['Sisa Dana / Saldo Saat Ini', currentBalance],
    ['Jumlah Transaksi Tercatat', transactions.length],
  ];

  try {
    await fetch(`${SHEETS_BASE_URL}/${spreadsheetId}/values/'Ringkasan Bulanan'!A1:B9?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: summaryValues,
      }),
    });
  } catch (err) {
    console.warn('Gagal memperbarui tab Ringkasan:', err);
  }
}
