// App.jsx
import React, { useState, useEffect } from 'react';
import { login, logout, getStatus, getHistoryEvents, getHistoryIndications } from './services/api';
import { initSocket, disconnectSocket } from './services/socket';
import { RouterInfo } from './components/RouterInfo';
import { ResourceChart } from './components/ResourceChart';
import { QosChart } from './components/QosChart';
import { InterfaceTable } from './components/InterfaceTable';
import { IndicationTable } from './components/IndicationTable';
import { EventTable } from './components/EventTable';
import { ToggleSwitch } from './components/ToggleSwitch';
import { LoginForm } from './components/LoginForm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [router, setRouter] = useState({
    name: '',
    ip: '',
    version: '',
    architecture: '',
    board: '',
    platform: '',
    cpu: '',
    cpu_count: '',
    total_memory: ''
  });
  const [uptime, setUptime] = useState('');
  const [pingTarget, setPingTarget] = useState('');
  const [windows, setWindows] = useState({
    cpu: { data: [], stats: { avg: 0, min: 0, max: 0 } },
    memory: { data: [], stats: { avg: 0, min: 0, max: 0 } },
    delay: { data: [], stats: { avg: 0, min: 0, max: 0 } },
    packetLoss: { data: [], stats: { avg: 0, min: 0, max: 0 } },
  });
  const [interfaces, setInterfaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [indications, setIndications] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [historyIndications, setHistoryIndications] = useState([]);
  const [isRealtime, setIsRealtime] = useState(true);
  const [loading, setLoading] = useState(false);

  const currentCpu = windows.cpu.data.length ? windows.cpu.data[windows.cpu.data.length - 1].loadPct : 0;
  const lastMemory = windows.memory.data.length ? windows.memory.data[windows.memory.data.length - 1] : null;
  const currentDelay = windows.delay.data.length ? windows.delay.data[windows.delay.data.length - 1].avgMs : 0;
  const lastPacketLoss = windows.packetLoss.data.length ? windows.packetLoss.data[windows.packetLoss.data.length - 1] : null;
  const currentPacketLossPct = lastPacketLoss && lastPacketLoss.packetSent
    ? ((lastPacketLoss.packetSent - lastPacketLoss.packetReceive) / lastPacketLoss.packetSent) * 100
    : 0;

  useEffect(() => {
    getStatus()
      .then((res) => {
        if (res.ok && res.running) {
          setIsLoggedIn(true);
          if (res.router) {
            setRouter({
              name: res.router.name || '',
              ip: res.router.ip || '',
              version: res.router.version || '',
              architecture: res.router.architecture_name || res.router.architecture || '',
              board: res.router.board_name || res.router.board || '',
              platform: res.router.platform || '',
              cpu: res.router.cpu || '',
              cpu_count: res.router.cpu_count || '',
              total_memory: res.router.total_memory || ''
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoggedIn && router.ip) {
      const socket = initSocket();
      socket.on('snapshot', (data) => {
        if (data.router) {
          setRouter({
            name: data.router.name || '',
            ip: data.router.ip || '',
            version: data.router.version || '',
            architecture: data.router.architecture_name || data.router.architecture || '',
            board: data.router.board_name || data.router.board || '',
            platform: data.router.platform || '',
            cpu: data.router.cpu || '',
            cpu_count: data.router.cpu_count || '',
            total_memory: data.router.total_memory || ''
          });
        }
        setUptime(data.uptime || '');
        setPingTarget(data.pingTarget || '');
        setWindows({
          cpu: { data: data.windows?.cpu?.data || [], stats: data.windows?.cpu?.stats || { avg: 0, min: 0, max: 0 } },
          memory: { data: data.windows?.memory?.data || [], stats: data.windows?.memory?.stats || { avg: 0, min: 0, max: 0 } },
          delay: { data: data.windows?.delay?.data || [], stats: data.windows?.delay?.stats || { avg: 0, min: 0, max: 0 } },
          packetLoss: { data: data.windows?.packetLoss?.data || [], stats: data.windows?.packetLoss?.stats || { avg: 0, min: 0, max: 0 } },
        });
        setInterfaces(data.interfaces || []);
        setEvents(data.events || []);
        setIndications(data.indications || []);
      });
      return () => {
        socket.off('snapshot');
        disconnectSocket();
      };
    }
  }, [isLoggedIn, router.ip]);

  useEffect(() => {
    if (!isRealtime && router.ip) {
      setLoading(true);
      Promise.all([
        getHistoryEvents(router.ip),
        getHistoryIndications(router.ip),
      ])
        .then(([eventsRes, indsRes]) => {
          setHistoryEvents(eventsRes.data || []);
          setHistoryIndications(indsRes.data || []);
        })
        .finally(() => setLoading(false));
    }
  }, [isRealtime, router.ip]);

  const handleLogin = async (host, username, password) => {
    try {
      const res = await login(host, username, password);
      if (res.ok && res.router) {
        setIsLoggedIn(true);
        setRouter({
          name: res.router.name || '',
          ip: res.router.ip || '',
          version: res.router.version || '',
          architecture: res.router.architecture_name || res.router.architecture || '',
          board: res.router.board_name || res.router.board || '',
          platform: res.router.platform || '',
          cpu: res.router.cpu || '',
          cpu_count: res.router.cpu_count || '',
          total_memory: res.router.total_memory || ''
        });
      } else {
        alert('Login gagal');
      }
    } catch {
      alert('Login error');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setRouter({
      name: '',
      ip: '',
      version: '',
      architecture: '',
      board: '',
      platform: '',
      cpu: '',
      cpu_count: '',
      total_memory: ''
    });
    setUptime('');
    setPingTarget('');
    setWindows({ cpu: { data: [] }, memory: { data: [] }, delay: { data: [] }, packetLoss: { data: [] } });
    setInterfaces([]);
    setEvents([]);
    setIndications([]);
    disconnectSocket();
  };

  const computePacketLossStats = (data) => {
    if (!data || data.length === 0) return { totalSent: 0, totalReceived: 0, totalLoss: 0, lossPct: 0 };
    const totalSent = data.reduce((sum, d) => sum + (d.packetSent || 0), 0);
    const totalReceived = data.reduce((sum, d) => sum + (d.packetReceive || 0), 0);
    const totalLoss = totalSent - totalReceived;
    const lossPct = totalSent ? (totalLoss / totalSent * 100).toFixed(2) : 0;
    return { totalSent, totalReceived, totalLoss, lossPct };
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const activeEventsCount = events.filter((e) => e.status === 'active').length;
  const activeIndicationsCount = indications.filter((i) => i.status === 'active').length;
  const displayEvents = isRealtime ? events : historyEvents;
  const displayIndications = isRealtime ? indications : historyIndications;
  const packetStats = computePacketLossStats(windows?.packetLoss?.data || []);

  return (
    <section className="bg-gray-100 min-h-screen p-4">
      <div className="container mx-auto">
        <RouterInfo router={router} uptime={uptime} onLogout={handleLogout} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h5 className="font-bold text-xl text-gray-800 mb-3">Resource Usage</h5>
            <div className="h-48">
              <ResourceChart 
                cpuData={windows?.cpu?.data || []} 
                memData={windows?.memory?.data || []} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">CPU</div>
                <div className="flex justify-between text-sm">
                  <span>Current: {currentCpu.toFixed(2)}%</span>
                  <span>Avg: {windows?.cpu?.stats?.avg ?? 0}%</span>
                  <span>Min: {windows?.cpu?.stats?.min ?? 0}%</span>
                  <span>Max: {windows?.cpu?.stats?.max ?? 0}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">Memory</div>
                <div className="flex flex-col text-sm gap-1">
                  <div className="flex justify-between">
                    <span>Total: {router.total_memory} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used: {lastMemory?.usedMem?.toFixed(2) ?? 0} MB ({lastMemory?.usedMemPct?.toFixed(2) ?? 0}%)</span>
                    <span>Free: {lastMemory?.freeMem?.toFixed(2) ?? 0} MB ({lastMemory?.freeMemPct?.toFixed(2) ?? 0}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg: {windows?.memory?.stats?.avg ?? 0}%</span>
                    <span>Min: {windows?.memory?.stats?.min ?? 0}%</span>
                    <span>Max: {windows?.memory?.stats?.max ?? 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-5" />

            <div className="flex flex-wrap justify-between items-center">
              <h5 className="font-bold text-xl text-gray-800">QoS Monitoring</h5>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Target Ping: {pingTarget}</span>
            </div>
            <div className="h-48 mt-3">
              <QosChart 
                packetLossData={windows?.packetLoss?.data || []} 
                delayData={windows?.delay?.data || []} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">Packet Loss</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <span>Current Loss: {currentPacketLossPct.toFixed(2)}%</span>
                  <span>Sent: {packetStats.totalSent}</span>
                  <span>Received: {packetStats.totalReceived}</span>
                  <span>Loss: {packetStats.totalLoss}</span>
                  <span>Loss% (total): {packetStats.lossPct}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">Delay</div>
                <div className="flex justify-between text-sm">
                  <span>Current: {currentDelay.toFixed(2)} ms</span>
                  <span>Avg: {windows?.delay?.stats?.avg ?? 0} ms</span>
                  <span>Min: {windows?.delay?.stats?.min ?? 0} ms</span>
                  <span>Max: {windows?.delay?.stats?.max ?? 0} ms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md">
            <ToggleSwitch isRealtime={isRealtime} onToggle={() => setIsRealtime(!isRealtime)} />
            {loading && <p className="text-center text-gray-500 py-4">Memuat history...</p>}
            <IndicationTable
              indications={displayIndications}
              activeCount={activeIndicationsCount}
              showEnded={!isRealtime}
            />
            <EventTable
              events={displayEvents}
              activeCount={activeEventsCount}
              showEnded={!isRealtime}
            />
          </div>
        </div>

        <InterfaceTable interfaces={interfaces} />
      </div>
    </section>
  );
}

export default App;