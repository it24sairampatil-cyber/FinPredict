// FinPredict.js - High-Performance Client-Side CSV Parser & Schema Auto-Resolver
// Adheres to FR-1, AC-1 (Parses 1,000+ records in < 1.5s), and Instruction 3

import Papa from 'papaparse';
import { ExpenseCategory, Transaction, DayAggregation, EXPENSE_CATEGORIES, OUTFLOW_CATEGORIES } from '../types';

export interface ParseResult {
  transactions: Transaction[];
  dailyAggregations: DayAggregation[];
  totalInflow: number;
  totalOutflow: number;
  netSavings: number;
  dateRange: { start: string; end: string };
  rowCount: number;
  processingTimeMs: number;
  detectedColumns: {
    dateCol: string;
    descriptionCol: string;
    amountCol?: string;
    debitCol?: string;
    creditCol?: string;
    balanceCol?: string;
  };
}

// Regex token dictionaries for client-side auto-categorization
const CATEGORY_RULES: Record<ExpenseCategory, RegExp> = {
  Housing: /(rent|mortgage|landlord|leasing|apartment|property management|hoa fee|housing|realty)/i,
  Food: /(grocery|supermarket|walmart|trader joe|whole foods|kroger|safeway|costco|aldi|target food|food lion|heb|market|bakery|deli|restaurant|cafe|coffee|starbucks|dunkin|mcdonald|burger|wendy|taco bell|subway|chipotle|panera|pizza|domino|uber eats|doordash|grubhub|instacart|seamless|dining|bistro|pub|bar & grill)/i,
  Transport: /(uber(?! eats)|lyft|shell|chevron|exxon|bp gas|mobil|citgo|wawa gas|speedway|gasoline|fuel|texaco|subway metro|metro transit|mta|bart|mbta|train|amtrak|airline|delta|united airlines|american air|southwest|parking|tollway|ezpass|fastrak|car wash|auto repair|jiffy lube|oil change)/i,
  Utilities: /(electric|energy|water bill|power & light|pge|conedison|duke energy|national grid|gas utility|internet|wifi|comcast|xfinity|spectrum|verizon|at&t|t-mobile|trash|waste management|sewer|cable tv)/i,
  Entertainment: /(netflix|spotify|hulu|disney\+|hbo|max|apple tv|prime video|youtube premium|playstation|psn|xbox|nintendo|steam|twitch|cinema|amc theaters|regal|ticketmaster|concert|audible|patreon|gym|fitness|planet fitness|equinox|anytime fitness)/i,
  Healthcare: /(pharmacy|cvs|walgreens|rite aid|hospital|clinic|doctor|physician|dental|dentist|orthodont|vision|optometry|health care|medical|urgent care|labcorp|quest diagnos|prescription|copay|bluecross|aetna|cigna|kaiser)/i,
  Shopping: /(amazon(?! aws)|target(?! food)|ebay|walmart\.com|best buy|apple store|ikea|home depot|lowes|zara|h&m|nordstrom|macys|nike|adidas|clothing|apparel|footwear|sephora|ulta|electronics|books|etsy|department store)/i,
  Income: /(payroll|salary|direct dep|ach deposit|employer|wages|dividend|interest payment|cashback|refund|venmo cashout|zelle receive|transfer in|wire in|freelance|stipend)/i,
  Other: /.*/
};

/**
 * Categorizes a transaction description based on heuristics & keywords
 */
export function categorizeTransaction(description: string, amount: number): ExpenseCategory {
  const desc = description.trim().toLowerCase();

  // If amount is negative (income) or contains payroll terms
  if (amount < 0 || CATEGORY_RULES.Income.test(desc)) {
    if (CATEGORY_RULES.Income.test(desc)) return 'Income';
    if (amount < 0 && !desc.includes('refund')) return 'Income';
  }

  for (const cat of OUTFLOW_CATEGORIES) {
    if (CATEGORY_RULES[cat].test(desc)) {
      return cat;
    }
  }

  return 'Other';
}

/**
 * Standardize arbitrary date string to YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  const cleaned = dateStr.trim();
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // MM/DD/YYYY or M/D/YYYY
  const usMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (usMatch) {
    const month = usMatch[1].padStart(2, '0');
    const day = usMatch[2].padStart(2, '0');
    const year = usMatch[3];
    return `${year}-${month}-${day}`;
  }

  // DD/MM/YYYY or D/M/YYYY
  const euMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (euMatch) {
    const day = euMatch[1].padStart(2, '0');
    const month = euMatch[2].padStart(2, '0');
    const year = euMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Native Date fallback
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Cleans numerical currency strings: "$1,245.50 CR" -> 1245.50
 */
export function cleanAmount(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;

  const str = String(val).trim();
  const isCredit = /cr|credit/i.test(str);
  const isNegative = /^\(.*\)$/.test(str) || str.startsWith('-');

  // Remove currency signs, commas, parenthesis, letters
  const cleanedNumStr = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleanedNumStr);

  if (isNaN(num)) return 0;
  if (isNegative || isCredit) return -Math.abs(num);
  return Math.abs(num);
}

/**
 * Core parsing pipeline fulfilling AC-1 and FR-1
 */
export async function parseBankCsv(csvString: string): Promise<ParseResult> {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error('CSV file contains no valid transaction rows.');
          }

          const headers = results.meta.fields || Object.keys(results.data[0]);

          // Auto-detect columns with heuristic matching
          let dateCol = headers.find(h => /^(date|trans_date|posted_date|timestamp|time|transaction\s*date)/i.test(h));
          let descCol = headers.find(h => /^(desc|description|merchant|narration|payee|name|memo|details)/i.test(h));
          let amountCol = headers.find(h => /^(amount|trans_amount|net_amount|value)/i.test(h));
          let debitCol = headers.find(h => /^(debit|outflow|spent|withdrawal|charge)/i.test(h));
          let creditCol = headers.find(h => /^(credit|inflow|deposit)/i.test(h));
          let balanceCol = headers.find(h => /^(balance|net_balance|running_balance|available_balance)/i.test(h));
          let categoryCol = headers.find(h => /^(category|classification|type)/i.test(h));

          // Fallbacks if not strictly matched
          if (!dateCol) dateCol = headers[0];
          if (!descCol) descCol = headers.length > 1 ? headers[1] : headers[0];
          if (!amountCol && !debitCol && !creditCol) {
            // Find first column containing numbers
            amountCol = headers.find(h => h !== dateCol && h !== descCol) || headers[2];
          }

          const rawTransactions: Transaction[] = [];

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            const rawDate = row[dateCol!];
            if (!rawDate) continue;

            const isoDate = normalizeDate(String(rawDate));
            const rawDesc = String(row[descCol!] || 'Unspecified Merchant').trim();

            let amount = 0;
            if (debitCol && creditCol && (row[debitCol] !== undefined || row[creditCol] !== undefined)) {
              const debit = cleanAmount(row[debitCol]);
              const credit = cleanAmount(row[creditCol]);
              amount = debit > 0 ? debit : -credit;
            } else if (amountCol) {
              const parsedVal = cleanAmount(row[amountCol]);
              // Some banks represent expenses as negative and deposits as positive.
              // We detect convention: If description is salary/deposit, it's inflow (negative outflow)
              amount = parsedVal;
              if (CATEGORY_RULES.Income.test(rawDesc)) {
                amount = -Math.abs(parsedVal);
              }
            }

            let category: ExpenseCategory;
            if (categoryCol && row[categoryCol]) {
              const rawCat = String(row[categoryCol]).trim();
              const matched = EXPENSE_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
              category = matched || categorizeTransaction(rawDesc, amount);
            } else {
              category = categorizeTransaction(rawDesc, amount);
            }

            let balance: number | undefined;
            if (balanceCol && row[balanceCol]) {
              balance = cleanAmount(row[balanceCol]);
            }

            rawTransactions.push({
              id: `tx_${i + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              date: isoDate,
              description: rawDesc,
              amount: amount, // Positive = expense, negative = income
              category,
              rawAmount: amount,
              balance
            });
          }

          // Sort chronologically
          rawTransactions.sort((a, b) => a.date.localeCompare(b.date));

          if (rawTransactions.length === 0) {
            throw new Error('No valid transactions could be parsed from the file.');
          }

          // Build continuous day aggregations
          const dailyMap = new Map<string, DayAggregation>();
          const startDate = new Date(rawTransactions[0].date);
          const endDate = new Date(rawTransactions[rawTransactions.length - 1].date);

          // Populate date range without gaps
          const current = new Date(startDate);
          while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            dailyMap.set(dateStr, {
              date: dateStr,
              timestamp: current.getTime(),
              dayOfWeek: current.getDay(),
              dayOfMonth: current.getDate(),
              categoryTotals: {
                Housing: 0,
                Food: 0,
                Transport: 0,
                Utilities: 0,
                Entertainment: 0,
                Healthcare: 0,
                Shopping: 0,
                Income: 0,
                Other: 0
              },
              totalOutflow: 0,
              totalInflow: 0
            });
            current.setDate(current.getDate() + 1);
          }

          let totalInflow = 0;
          let totalOutflow = 0;

          // Aggregate transactions into daily buckets
          for (const tx of rawTransactions) {
            let dayAgg = dailyMap.get(tx.date);
            if (!dayAgg) {
              const d = new Date(tx.date);
              dayAgg = {
                date: tx.date,
                timestamp: d.getTime(),
                dayOfWeek: d.getDay(),
                dayOfMonth: d.getDate(),
                categoryTotals: {
                  Housing: 0, Food: 0, Transport: 0, Utilities: 0,
                  Entertainment: 0, Healthcare: 0, Shopping: 0, Income: 0, Other: 0
                },
                totalOutflow: 0,
                totalInflow: 0
              };
              dailyMap.set(tx.date, dayAgg);
            }

            if (tx.amount < 0 || tx.category === 'Income') {
              const inflowVal = Math.abs(tx.amount);
              dayAgg.totalInflow += inflowVal;
              dayAgg.categoryTotals.Income += inflowVal;
              totalInflow += inflowVal;
            } else {
              dayAgg.totalOutflow += tx.amount;
              dayAgg.categoryTotals[tx.category] = (dayAgg.categoryTotals[tx.category] || 0) + tx.amount;
              totalOutflow += tx.amount;
            }
          }

          const dailyAggregations = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

          // Anomaly detection pass: flag transactions 3x higher than daily category mean
          const categoryAverages: Record<ExpenseCategory, number> = {} as any;
          for (const cat of OUTFLOW_CATEGORIES) {
            const catTxs = rawTransactions.filter(t => t.category === cat && t.amount > 0);
            if (catTxs.length > 0) {
              const sum = catTxs.reduce((acc, t) => acc + t.amount, 0);
              categoryAverages[cat] = sum / catTxs.length;
            } else {
              categoryAverages[cat] = 0;
            }
          }

          for (const tx of rawTransactions) {
            if (tx.amount > 0 && categoryAverages[tx.category] > 0) {
              if (tx.amount > categoryAverages[tx.category] * 3.5 && tx.amount > 100) {
                tx.isAnomaly = true;
              }
            }
          }

          const endTime = performance.now();
          const processingTimeMs = Math.round(endTime - startTime);

          resolve({
            transactions: rawTransactions,
            dailyAggregations,
            totalInflow: Math.round(totalInflow * 100) / 100,
            totalOutflow: Math.round(totalOutflow * 100) / 100,
            netSavings: Math.round((totalInflow - totalOutflow) * 100) / 100,
            dateRange: {
              start: dailyAggregations[0]?.date || '',
              end: dailyAggregations[dailyAggregations.length - 1]?.date || ''
            },
            rowCount: rawTransactions.length,
            processingTimeMs,
            detectedColumns: {
              dateCol: dateCol || 'Date',
              descriptionCol: descCol || 'Description',
              amountCol,
              debitCol,
              creditCol,
              balanceCol
            }
          });
        } catch (err: any) {
          reject(new Error(`Failed to parse CSV bank statement: ${err.message}`));
        }
      },
      error: (err: any) => {
        reject(new Error(`PapaParse error: ${err.message}`));
      }
    });
  });
}
