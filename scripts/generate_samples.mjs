// FinPredict.js - Standalone Sample CSV Generator for Deliverable D-3
import fs from 'fs';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 1. Tech Worker Profile (1,200+ rows)
function generateTechWorkerCsv() {
  const rows = ['Date,Description,Amount,Balance,Category'];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 180);

  let balance = 12500.0;
  const merchants = {
    Food: [
      { desc: 'Whole Foods Market', min: 45, max: 140 },
      { desc: "Trader Joe's", min: 35, max: 95 },
      { desc: 'Starbucks Coffee', min: 4.5, max: 8.5 },
      { desc: 'Sweetgreen Salad', min: 14.5, max: 22.0 },
      { desc: 'Chipotle Mexican Grill', min: 12.0, max: 18.0 },
      { desc: 'Uber Eats - Japanese Bistro', min: 32.0, max: 68.0 }
    ],
    Transport: [
      { desc: 'Uber Trip San Francisco', min: 15.0, max: 38.0 },
      { desc: 'Shell Oil Gasoline', min: 42.0, max: 65.0 },
      { desc: 'BART Metro Transit', min: 4.8, max: 9.6 },
      { desc: 'Fastrak Bay Bridge Toll', min: 7.0, max: 7.0 }
    ],
    Entertainment: [
      { desc: 'Netflix Subscription', min: 19.99, max: 19.99 },
      { desc: 'Spotify Premium', min: 10.99, max: 10.99 },
      { desc: 'Equinox Gym Membership', min: 260.0, max: 260.0 },
      { desc: 'Steam Games Digital', min: 29.99, max: 69.99 }
    ],
    Shopping: [
      { desc: 'Amazon.com Prime Order', min: 24.0, max: 120.0 },
      { desc: 'Apple Store Retail', min: 49.0, max: 199.0 },
      { desc: 'Nordstrom Dept Store', min: 65.0, max: 150.0 }
    ],
    Healthcare: [
      { desc: 'CVS Pharmacy Prescription', min: 15.0, max: 45.0 },
      { desc: 'One Medical Clinic Copay', min: 30.0, max: 50.0 }
    ],
    Utilities: [
      { desc: 'PG&E Electric Utility', min: 110.0, max: 165.0 },
      { desc: 'Comcast Xfinity Gigabit Wifi', min: 85.0, max: 85.0 },
      { desc: 'T-Mobile Wireless Phone Bill', min: 90.0, max: 90.0 }
    ]
  };

  const curr = new Date(startDate);
  while (curr <= today) {
    const dayOfMonth = curr.getDate();
    const dateStr = formatDate(curr);

    if (dayOfMonth === 1 || dayOfMonth === 15) {
      const salary = 5400.0;
      balance += salary;
      rows.push(`${dateStr},"TECH CORP PAYROLL DIRECT DEP",-${salary.toFixed(2)},${balance.toFixed(2)},Income`);
    }

    if (dayOfMonth === 1) {
      const rent = 2450.0;
      balance -= rent;
      rows.push(`${dateStr},"AVALON BAY APARTMENTS RENT",${rent.toFixed(2)},${balance.toFixed(2)},Housing`);
    }

    if (dayOfMonth === 10) {
      for (const u of merchants.Utilities) {
        const val = u.min + Math.random() * (u.max - u.min);
        balance -= val;
        rows.push(`${dateStr},"${u.desc}",${val.toFixed(2)},${balance.toFixed(2)},Utilities`);
      }
    }

    const numDailyTx = 5 + Math.floor(Math.random() * 4);
    for (let k = 0; k < numDailyTx; k++) {
      const catList = ['Food', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare'];
      const selectedCat = catList[Math.floor(Math.random() * catList.length)];
      const choices = merchants[selectedCat];
      const m = choices[Math.floor(Math.random() * choices.length)];
      const amount = Math.round((m.min + Math.random() * (m.max - m.min)) * 100) / 100;
      balance -= amount;
      rows.push(`${dateStr},"${m.desc}",${amount.toFixed(2)},${balance.toFixed(2)},${selectedCat}`);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return rows.join('\n');
}

// 2. Anomaly Shock Profile (900+ rows)
function generateAnomalyShockCsv() {
  const rows = ['Date,Description,Amount,Balance,Category'];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 140);

  let balance = 15000.0;
  const curr = new Date(startDate);
  let dayCounter = 0;

  while (curr <= today) {
    dayCounter++;
    const day = curr.getDate();
    const dateStr = formatDate(curr);

    if (day === 1 || day === 15) {
      balance += 4800.0;
      rows.push(`${dateStr},"CORPORATE PAYROLL ACH DEPOSIT",-4800.00,${balance.toFixed(2)},Income`);
    }

    if (day === 1) {
      balance -= 2100.0;
      rows.push(`${dateStr},"RESIDENTIAL LEASE PAYMENT",2100.00,${balance.toFixed(2)},Housing`);
    }

    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const amt = Math.round((15 + Math.random() * 65) * 100) / 100;
      balance -= amt;
      rows.push(`${dateStr},"Supermarket Food & Sundries",${amt.toFixed(2)},${balance.toFixed(2)},Food`);
    }

    if (dayCounter === 45) {
      balance -= 2650.0;
      rows.push(`${dateStr},"REGIONAL HOSPITAL EMERGENCY CARE COPAY",2650.00,${balance.toFixed(2)},Healthcare`);
    }

    if (dayCounter === 95) {
      balance -= 1820.0;
      rows.push(`${dateStr},"DELTA AIRLINES EMERGENCY FLIGHT",1820.00,${balance.toFixed(2)},Transport`);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return rows.join('\n');
}

// 3. Family Budget Profile (1,500+ rows)
function generateFamilyCsv() {
  const rows = ['Timestamp,Narration,Transaction_Amount,Running_Balance'];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 200);

  let balance = 24000.0;
  const merchants = [
    { desc: 'Costco Wholesale Bulk Groceries', min: 180, max: 380 },
    { desc: 'Safeway Supermarket Weekly Run', min: 95, max: 190 },
    { desc: 'Target Household Essentials', min: 65, max: 160 },
    { desc: 'Home Depot Lawn & Garden Repair', min: 45, max: 220 },
    { desc: 'Shell Oil Dual Vehicle Fill-up', min: 65, max: 110 },
    { desc: 'Pediatric Care Health Copay', min: 40, max: 90 },
    { desc: 'Walgreens Family Prescriptions', min: 25, max: 65 }
  ];

  const curr = new Date(startDate);
  while (curr <= today) {
    const day = curr.getDate();
    const dateStr = formatDate(curr);

    if (day === 1 || day === 15) {
      balance += 4250.0;
      rows.push(`${dateStr},"PRIMARY EMPLOYER ACH SALARY",-4250.00,${balance.toFixed(2)}`);
    }

    if (day === 1) {
      balance -= 3150.0;
      rows.push(`${dateStr},"CHASE HOME MORTGAGE PAYMENT",3150.00,${balance.toFixed(2)}`);
    }

    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const item = merchants[Math.floor(Math.random() * merchants.length)];
      const amt = Math.round((item.min + Math.random() * (item.max - item.min)) * 100) / 100;
      balance -= amt;
      rows.push(`${dateStr},"${item.desc}",${amt.toFixed(2)},${balance.toFixed(2)}`);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return rows.join('\n');
}

// 4. College Student Profile (600+ rows)
function generateStudentCsv() {
  const rows = ['Date,Merchant,Debit,Credit,Balance'];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 120);

  let balance = 1800.0;
  const merchants = [
    { desc: 'Campus Bookstore Textbooks', min: 45, max: 120 },
    { desc: "Trader Joe's Dorm Snacks", min: 25, max: 60 },
    { desc: 'Taco Bell Late Night', min: 6.5, max: 14.0 },
    { desc: 'Subway Sandwiches', min: 8.5, max: 13.0 },
    { desc: 'Spotify Student Bundle', min: 5.99, max: 5.99 },
    { desc: 'Steam Store Gaming', min: 14.99, max: 39.99 },
    { desc: 'Lyft Ride Campus Shuttle', min: 8.0, max: 16.0 },
    { desc: 'CVS Pharmacy Allergy Meds', min: 12.0, max: 24.0 }
  ];

  const curr = new Date(startDate);
  while (curr <= today) {
    const day = curr.getDate();
    const dateStr = formatDate(curr);

    if (day === 1) {
      balance += 1450.0;
      rows.push(`${dateStr},"CAMPUS DINING WAGE STIPEND",,1450.00,${balance.toFixed(2)}`);
      balance -= 700.0;
      rows.push(`${dateStr},"VARSITY HOUSING SHARED LEASE",700.00,,${balance.toFixed(2)}`);
    }

    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const item = merchants[Math.floor(Math.random() * merchants.length)];
      const amt = Math.round((item.min + Math.random() * (item.max - item.min)) * 100) / 100;
      balance -= amt;
      rows.push(`${dateStr},"${item.desc}",${amt.toFixed(2)},,${balance.toFixed(2)}`);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return rows.join('\n');
}

fs.writeFileSync('sample_data/tech_worker_1200_rows.csv', generateTechWorkerCsv());
fs.writeFileSync('sample_data/anomaly_shock_900_rows.csv', generateAnomalyShockCsv());
fs.writeFileSync('sample_data/family_budget_1500_rows.csv', generateFamilyCsv());
fs.writeFileSync('sample_data/college_student_600_rows.csv', generateStudentCsv());

console.log('Generated 4 sample CSV datasets in ./sample_data/');
