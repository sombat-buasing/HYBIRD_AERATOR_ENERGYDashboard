import { useEffect, useState } from "react";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

// import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import PowerChart from "./components/PowerChart";
import EnergyChart from "./components/EnergyChart";

import { API_URL } from "./config";

function App() {
  const [config, setConfig] = useState(null);

  const loadConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config`);

      setConfig(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const electricRate = Number(config?.electric_rate || 0);
  const [selectedDevice, setSelectedDevice] = useState("");

  const [devices, setDevices] = useState([]);

  const [summary, setSummary] = useState({
    devices: 0,
    online: 0,
    power: 0,
    energy: 0,
  });

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDateTime = () => {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const [history, setHistory] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const loadHistory = async () => {
    if (!selectedDevice) {
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/history/${selectedDevice}`);

      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const [refreshTime, setRefreshTime] = useState("");

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/current`);

      const data = res.data.data || [];

      setDevices(data);

      if (!selectedDevice && data.length > 0) {
        setSelectedDevice(data[0].device_id);
      }

      const onlineCount = data.filter((d) => {
        const diff = (new Date() - new Date(d.last_update)) / 1000 / 60;

        return diff < 5;
      }).length;

      const totalPower = data.reduce(
        (sum, d) => sum + Number(d.power_total || 0),
        0,
      );

      const totalEnergy = data.reduce(
        (sum, d) => sum + Number(d.energy_kwh || 0),
        0,
      );

      setSummary({
        devices: data.length,

        online: onlineCount,

        power: totalPower,

        energy: totalEnergy,
      });
    } catch (err) {
      console.error(err);
    }
    setRefreshTime(formatDateTime());
  };
  const [dailySummary, setDailySummary] = useState({
    today: 0,
    yesterday: 0,
  });

  const loadDailySummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/summary/${selectedDevice}`);

      const rows = res.data.data || [];

      setDailySummary({
        today: Number(rows[0]?.daily_kwh || 0),
        yesterday: Number(rows[1]?.daily_kwh || 0),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [monthly, setMonthly] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const loadMonthly = async (deviceId) => {
    try {
      const res = await axios.get(`${API_URL}/api/monthly/${deviceId}`);

      setMonthly(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedDevice) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDailySummary();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }

    const fetchData = async () => {
      try {
        const historyRes = await axios.get(
          `${API_URL}/api/history/${selectedDevice}`,
        );

        setHistory(historyRes.data.data || []);

        const summaryRes = await axios.get(
          `${API_URL}/api/daily-summary/${selectedDevice}`,
        );

        const rows = summaryRes.data.data || [];

        const today = Number(rows[0]?.daily_kwh || 0);

        const yesterday = Number(rows[1]?.daily_kwh || 0);

        setDailySummary({
          today,
          yesterday,
          diff: today - yesterday,
        });

        // ===== Monthly =====

        const monthlyRes = await axios.get(
          `${API_URL}/api/monthly/${selectedDevice}`,
        );

        setMonthly(monthlyRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedDevice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();

    const timer = setInterval(() => {
      loadData();

      loadConfig();

      if (selectedDevice) {
        loadDailySummary();
      }
    }, 5000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCardColor = (device) => {
    const now = new Date();
    const lastUpdate = new Date(device.last_update);

    const diffMinute = (now - lastUpdate) / 1000 / 60;

    if (diffMinute > 5) {
      return "#c62828"; // RED
    }

    if (Number(device.power_total) > 0.1) {
      return "#2e7d32"; // GREEN
    }

    return "#616161"; // GRAY
  };

  const Row = ({ label, value }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );

  const exportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet("Energy Report");

      worksheet.columns = [
        { header: "Date Time", key: "created_at", width: 25 },

        { header: "Voltage L1", key: "voltage_l1", width: 12 },
        { header: "Voltage L2", key: "voltage_l2", width: 12 },
        { header: "Voltage L3", key: "voltage_l3", width: 12 },

        { header: "Current L1", key: "current_l1", width: 12 },
        { header: "Current L2", key: "current_l2", width: 12 },
        { header: "Current L3", key: "current_l3", width: 12 },

        { header: "Power Total", key: "power_total", width: 12 },

        { header: "PF Total", key: "pf_total", width: 12 },

        { header: "Frequency", key: "frequency", width: 12 },

        { header: "Energy kWh", key: "energy_kwh", width: 15 },
      ];

      worksheet.autoFilter = {
        from: "A1",
        to: "K1",
      };

      worksheet.views = [
        {
          state: "frozen",
          ySplit: 1,
        },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "1F4E78",
          },
        };
      });

      history.forEach((row) => {
        worksheet.addRow({
          created_at: new Date(row.created_at).toLocaleString(),

          voltage_l1: row.voltage_l1,

          current_l1: row.current_l1,

          power_total: row.power_total,

          energy_kwh: row.energy_kwh,
        });
      });

      worksheet.getRow(1).font = {
        bold: true,
      };

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `${selectedDevice}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const todayCost = dailySummary.today * electricRate;

  const monthCost =
    (monthly.length > 0 ? Number(monthly[0].monthly_kwh) : 0) * electricRate;

  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 300,
            color: "black",
          }}
        >
          Energy Monitor Dashboard
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "#c5d5db",
            mt: 1,
          }}
        >
          Last Refresh : {refreshTime}
        </Typography>
      </Box>

      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md="auto">
          <Card sx={{ minWidth: 180, height: 140 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h3">{summary.devices}</Typography>
              <Typography variant="body2">Devices</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card
            sx={{ minWidth: 180,
              height: 140,
              bgcolor: "white",
              color: "black",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography>Online</Typography>
              <Typography variant="h3">{summary.online}</Typography>
              <Typography variant="body2">Devices</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ minWidth: 180, height: 140, bgcolor: "white", color: "black",}}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Power</Typography>
              <Typography variant="h3">{summary.power.toFixed(2)}</Typography>
              <Typography variant="body2">kW</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card
            sx={{
              minWidth: 374,
              height: 140,
              bgcolor: "white",
              color: "black",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Energy</Typography>
              <Typography variant="h3">{formatNumber(summary.energy)}
              </Typography>
              <Typography variant="body2">kWh</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={2}>
          <Card
            sx={{
              minWidth: 180,
              height: 140,
              bgcolor: "#2e7d32",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Today Energy</Typography>
              <Typography variant="h3">{dailySummary.today.toFixed(3)}</Typography>
              <Typography variant="body2">kWh</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card
            sx={{minWidth: 180, height: 140, bgcolor: "#1565c0", color: "white",}}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Previous Day</Typography>
              <Typography variant="h3">{dailySummary.yesterday.toFixed(3)}</Typography>
              <Typography >kWh</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{minWidth: 180,
              height: 140,
              bgcolor: "#7b1fa2",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">This Month</Typography>
              <Typography variant="h3">{config ? monthCost.toFixed(2) : "..."}</Typography>
              <Typography >kWh</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card
            sx={{minWidth: 180,height: 140, 
              bgcolor: "#ef6c00",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Today Cost</Typography>

              <Typography variant="h3">{todayCost.toFixed(2)}</Typography>

              <Typography variant="body2">THB</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <Card
            sx={{minWidth: 180,height: 140, 
              bgcolor: "#d84315",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Month Cost</Typography>

              <Typography variant="h3">{monthCost.toFixed(2)}</Typography>

              <Typography>THB</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Card
          sx={{
            mb: 3,
            p: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Device</InputLabel>

            <Select
              value={selectedDevice}
              label="Device"
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.map((d) => (
                <MenuItem key={d.device_id} value={d.device_id}>
                  {d.device_name}
                  {" - "}
                  {d.device_id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Button variant="contained" onClick={exportExcel}>
            EXPORT EXCEL
          </Button>
        </Box>

        <Card
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Power Trend
          </Typography>

          <PowerChart history={history} />
        </Card>

        <Card
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Energy Trend
          </Typography>

          <EnergyChart history={history} />
        </Card>

        <Grid container spacing={3}>
          {devices.map((d) => (
            <Grid item xs={12} md={6} lg={4} key={d.device_id}>
              <Card
                sx={{
                  bgcolor: getCardColor(d),
                  color: "white",
                  borderRadius: 3,
                  boxShadow: 5,
                }}
              >
                {" "}
                <CardContent>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      opacity: 0.85,
                      mb: 1,
                    }}
                  >
                    📍 {d.location_name}
                  </Typography>

                  <Typography variant="h5" align="center" gutterBottom>
                    {d.device_name}
                  </Typography>

                  <Typography align="center" sx={{ mb: 2 }}>
                    {d.device_id}
                  </Typography>

                  <Row
                    label="Voltage L1"
                    value={`${Number(d.voltage_l1).toFixed(1)} V`}
                  />

                  <Row
                    label="Voltage L2"
                    value={`${Number(d.voltage_l2).toFixed(1)} V`}
                  />

                  <Row
                    label="Voltage L3"
                    value={`${Number(d.voltage_l3).toFixed(1)} V`}
                  />

                  <hr />

                  <Row
                    label="Current L1"
                    value={`${Number(d.current_l1).toFixed(3)} A`}
                  />

                  <Row
                    label="Current L2"
                    value={`${Number(d.current_l2).toFixed(3)} A`}
                  />

                  <Row
                    label="Current L3"
                    value={`${Number(d.current_l3).toFixed(3)} A`}
                  />

                  <hr />

                  <Row
                    label="Power Total"
                    value={`${Number(d.power_total).toFixed(3)} kW`}
                  />

                  <Row label="PF Total" value={Number(d.pf_total).toFixed(3)} />

                  <Row
                    label="Frequency"
                    value={`${Number(d.frequency).toFixed(2)} Hz`}
                  />

                  <Row
                    label="Energy"
                    value={`${Number(d.energy_kwh).toLocaleString("en-US", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} kWh`}
                  />

                  <hr />

                  <Row label="IP Address" value={d.ip_address} />

                  <Row
                    label="Last Update"
                    value={new Date(d.last_update).toLocaleTimeString()}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default App;
