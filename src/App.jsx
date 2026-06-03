import { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  InputLabel,
  FormControl,
  MenuItem,
} from "@mui/material";
import PowerChart from "./components/PowerChart";
import EnergyChart from "./components/EnergyChart";

import { API_URL } from "./config";

function App() {
  const [selectedDevice, setSelectedDevice] = useState("ME337-001");

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

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/history/${selectedDevice}`);

      setHistory(res.data.data);
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
  // const loadHistory = async () => {
  //   const res = await axios.get(`${API_URL}/api/history/ME337-001`);

  //   setHistory(res.data.data);
  // };
  useEffect(() => {
    loadHistory();
  }, [selectedDevice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();

    const timer = setInterval(loadData, 5000);

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
            <Card>
              <CardContent>
                <Typography>Devices</Typography>
                <Typography variant="h4">{summary.devices}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card>
              <CardContent>
                <Typography>Online</Typography>
                <Typography variant="h4">{summary.online}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card>
              <CardContent>
                <Typography>Total Power</Typography>
                <Typography variant="h4">
                  {summary.power.toFixed(2)} kW
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card>
              <CardContent>
                <Typography>Total Energy</Typography>
                <Typography variant="h4">
                  {formatNumber(summary.energy)} kWh
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card
              sx={{
                height: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 3,
                boxShadow: 4
              }}
            >
            <CardContent>

              <Typography color="text.secondary">Devices</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                {summary.devices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 4
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Online</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                {summary.online}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 4
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Total Power</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                {summary.power.toFixed(2)} kW
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 4
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Total Energy</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                {formatNumber(summary.energy)} kWh
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

<Card
  sx={{
    mb: 3,
    p: 2
  }}
>
  <FormControl
    fullWidth
  >
    <InputLabel>
      Device
    </InputLabel>

    <Select

      value={
        selectedDevice
      }

      label="Device"

      onChange={(e)=>
        setSelectedDevice(
          e.target.value
        )
      }

    >

      {devices.map(
        (d) => (

          <MenuItem
            key={
              d.device_id
            }

            value={
              d.device_id
            }
          >
            {d.device_name}
            {" - "}
            {d.device_id}
          </MenuItem>

        )
      )}

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
      );
    </>
  );
}

export default App;
