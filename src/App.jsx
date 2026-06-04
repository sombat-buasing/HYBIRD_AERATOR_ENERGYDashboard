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

import PowerChart from "./components/PowerChart";
import EnergyChart from "./components/EnergyChart";

import { API_URL } from "./config";

function App() {
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

  console.log("History Count =", history.length);
  console.log(history);

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,

          bgcolor: "#0f172a",

          borderBottom: "1px solid #333",

          px: 3,
          py: 2,
        }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{
            color: "white",
            fontWeight: 300,
          }}
        >
          Energy Monitor Dashboard
        </Typography>

        <Typography
          align="center"
          sx={{
            color: "#cbd5e1",
            mb: 2,
          }}
        >
          Last Refresh : {refreshTime}
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Card
              sx={{
                bgcolor: "white",
                color: "black",
                minWidth: 120,
              }}
            >
              <CardContent>
                <Typography>Total</Typography>
                <Typography variant="h4">{summary.devices}</Typography>
                <Typography variant="body2">Devices</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card
              sx={{
                bgcolor: "white",
                color: "black",
                minWidth: 120,
              }}
            >
              <CardContent>
                <Typography>Online</Typography>
                <Typography variant="h4">{summary.online}</Typography>
                <Typography variant="body2">Devices</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card
              sx={{
                bgcolor: "white",
                color: "black",
                minWidth: 180,
              }}
            >
              <CardContent>
                <Typography>Total Power</Typography>
                <Typography variant="h4">
                  {summary.power.toFixed(2)}
                </Typography>
                <Typography variant="body2">kW</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card
              sx={{
                bgcolor: "white",
                color: "black",
                minWidth: 215,
              }}
            >
              <CardContent>
                <Typography>Total Energy</Typography>
                <Typography variant="h4">
                  {formatNumber(summary.energy)}
                </Typography>
                <Typography variant="body2">kWh</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card
              sx={{
                bgcolor: "#2e7d32",
                color: "white",
                minWidth: 180,
              }}
            >
              <CardContent>
                <Typography color="text.secondary">Today Energy</Typography>

                <Typography variant="h4">
                  {dailySummary.today.toFixed(3)}
                </Typography>

                <Typography variant="body2">kWh</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card
              sx={{
                bgcolor: "#1565c0",
                color: "white",
                minWidth: 180,
              }}
            >
              <CardContent>
                <Typography color="text.secondary">Previous Day</Typography>

                <Typography variant="h4">
                  {dailySummary.yesterday.toFixed(3)}
                </Typography>

                <Typography variant="body2">kWh</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
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
