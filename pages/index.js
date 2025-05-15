import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [commissions, setCommissions] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      let allData = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          defval: "",
        });

        sheet.forEach((row) => {
          allData.push({
            month: sheetName,
            customer: row["Customer"] || row["Provider Customer Name"],
            provider: row["Provider Name"],
            compPaid: parseFloat(row["Comp Paid"] || 0),
            type: extractComponentType(row["Notes"] || ""),
          });
        });
      });

      setCommissions((prev) => [...prev, ...allData]);
    };

    reader.readAsArrayBuffer(file);
  };

  const extractComponentType = (note) => {
    const match = note.match(/Component:(\w+)/);
    return match ? match[1] : "Unknown";
  };

  const summarizeByType = (type) => {
    return commissions
      .filter((item) => item.type === type)
      .reduce((acc, curr) => acc + curr.compPaid, 0)
      .toFixed(2);
  };

  const totalCommission = commissions.reduce(
    (acc, curr) => acc + curr.compPaid,
    0
  ).toFixed(2);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold">Upload Commission File</h2>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      </div>

      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold">Commission Summary</h2>
        <p>Total Commission: ${totalCommission}</p>
        <p>Upfront: ${summarizeByType("Upfront")}</p>
        <p>Spiff: ${summarizeByType("Spiff")}</p>
        <p>Residual: ${summarizeByType("Residual")}</p>
      </div>

      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold">Detailed Records</h2>
        <div className="grid grid-cols-5 gap-2 font-semibold border-b pb-2">
          <span>Month</span>
          <span>Customer</span>
          <span>Provider</span>
          <span>Type</span>
          <span>Comp Paid</span>
        </div>
        {commissions.map((entry, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-2 border-b py-1 text-sm"
          >
            <span>{entry.month}</span>
            <span>{entry.customer}</span>
            <span>{entry.provider}</span>
            <span>{entry.type}</span>
            <span>${entry.compPaid.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
