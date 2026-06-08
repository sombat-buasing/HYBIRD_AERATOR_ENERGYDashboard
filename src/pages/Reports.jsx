import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";

import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const exportMonthly = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/monthly/ME337-001`);

      const worksheet = XLSX.utils.json_to_sheet(res.data.data);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, `Monthly_Report.xlsx`);
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = async () => {
    try {
      const monthly = await axios.get(
        `${API_URL}/api/reports/monthly/ME337-001`,
      );

      const alarms = await axios.get(`${API_URL}/api/alarm/device/ME337-001`);

      const peaks = await axios.get(
        `${API_URL}/api/analytics/toppeak/ME337-001`,
      );

      const siteName = "BUILDING A";

      const doc = new jsPDF();

      //--------------------------------------------------
      // HEADER
      //--------------------------------------------------

      doc.setFillColor(41, 128, 185);

      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(24);

      doc.text("ME337 Energy Monitoring System", 14, 22);

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(12);

      doc.text(`Site : ${siteName}`, 14, 45);

      doc.text("Device : ME337-001", 14, 53);

      doc.text(`Generated : ${new Date().toLocaleString()}`, 14, 61);

      //--------------------------------------------------
      // Summary Box
      //--------------------------------------------------
      const energy = monthly.data.data[0]?.energy_kwh || 0;

      const peak = monthly.data.data[0]?.peak_kw || 0;

      const alarmCount = alarms.data.data.length;

      //--------------------------------------------------
      // Box1 Energy
      //--------------------------------------------------

      doc.setDrawColor(180);

      doc.roundedRect(14, 70, 50, 25, 3, 3);

      doc.setFontSize(10);

      doc.text("ENERGY USED", 20, 78);

      doc.setFontSize(16);

      doc.text(`${energy} kWh`, 20, 90);

      //--------------------------------------------------
      // Box2 Peak
      //--------------------------------------------------

      doc.roundedRect(80, 70, 50, 25, 3, 3);

      doc.setFontSize(10);

      doc.text("PEAK DEMAND", 86, 78);

      doc.setFontSize(16);

      doc.text(`${peak} kW`, 86, 90);

      //--------------------------------------------------
      // Box3 Alarm
      //--------------------------------------------------

      doc.roundedRect(146, 70, 50, 25, 3, 3);

      doc.setFontSize(10);

      doc.text("ALARM COUNT", 152, 78);

      doc.setFontSize(16);

      doc.text(`${alarmCount}`, 160, 90);

      //--------------------------------------------------
      // Monthly Report
      //--------------------------------------------------

      doc.setFontSize(16);

      doc.text("Monthly Energy Report", 14, 110);

      autoTable(doc, {
        startY: 115,

        head: [["Month", "Energy (kWh)", "Peak (kW)"]],

        body: monthly.data.data.map((row) => [
          row.report_month,
          row.energy_kwh,
          row.peak_kw,
        ]),
      });

      //--------------------------------------------------
      // Peak Events
      //--------------------------------------------------

      let y = doc.lastAutoTable.finalY + 15;

      doc.text("Top Peak Events", 14, y);

      autoTable(doc, {
        startY: y + 5,

        head: [["Date/Time", "Peak kW"]],

        body: peaks.data.data.map((row) => [
          new Date(row.created_at).toLocaleString(),

          row.power_total,
        ]),
      });

      //--------------------------------------------------
      // Alarm History
      //--------------------------------------------------

      y = doc.lastAutoTable.finalY + 15;

      doc.text("Alarm History", 14, y);

      autoTable(doc, {
        startY: y + 5,

        head: [["Time", "Type", "Message"]],

        body: alarms.data.data.map((row) => [
          new Date(row.created_at).toLocaleString(),

          row.alarm_type,

          row.alarm_message,
        ]),
      });

      //--------------------------------------------------
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFontSize(9);

        doc.setTextColor(120, 120, 120);

        doc.text("Generated by ME337 Energy Monitoring System", 14, 290);

        doc.text(`Page ${i} of ${pageCount}`, 180, 290);
      }

      doc.save("Energy_Report_ME337-001.pdf");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Report Center
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Monthly Energy Report</Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={exportMonthly}
              >
                EXPORT EXCEL
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Alarm History</Typography>

              <Button
                fullWidth
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
              >
                Export Excel
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Peak Events</Typography>

              <Button
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
              >
                Export Excel
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h5">PDF Report</Typography>

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={generatePDF}
            >
              GENERATE PDF
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}

export default Reports;
