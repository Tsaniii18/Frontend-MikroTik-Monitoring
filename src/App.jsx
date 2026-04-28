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

const INITIAL_ROUTER = {
  name: '', ip: '', version: '', architecture: '', board: '',
  platform: '', cpu: '', cpu_count: '', total_memory: ''
};

const INITIAL_WINDOWS = {
  cpu: { data: [], stats: { avg: 0, min: 0, max: 0 } },
  memory: { data: [], stats: { avg: 0, min: 0, max: 0 } },
  delay: { data: [], stats: { avg: 0, min: 0, max: 0 } },
  packetLoss: { data: [], stats: { avg: 0, min: 0, max: 0 } },
};

const buildRouter = (data) => ({
  name: data.name || '',
  ip: data.ip || '',
  version: data.version || '',
  architecture: data.architecture_name || data.architecture || '',
  board: data.board_name || data.board || '',
  platform: data.platform || '',
  cpu: data.cpu || '',
  cpu_count: data.cpu_count || '',
  total_memory: data.total_memory || ''
});

const computePacketLossStats = (data) => {
  if (!data?.length) return { totalSent: 0, totalReceived: 0, totalLoss: 0, lossPct: 0 };
  const totalSent = data.reduce((s, d) => s + (d.packetSent || 0), 0);
  const totalReceived = data.reduce((s, d) => s + (d.packetReceive || 0), 0);
  const totalLoss = totalSent - totalReceived;
  const lossPct = totalSent ? ((totalLoss / totalSent) * 100).toFixed(2) : 0;
  return { totalSent, totalReceived, totalLoss, lossPct: Number(lossPct) };
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [router, setRouter] = useState(INITIAL_ROUTER);
  const [uptime, setUptime] = useState('');
  const [pingTarget, setPingTarget] = useState('');
  const [windows, setWindows] = useState(INITIAL_WINDOWS);
  const [interfaces, setInterfaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [indications, setIndications] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [historyIndications, setHistoryIndications] = useState([]);
  const [isRealtime, setIsRealtime] = useState(true);
  const [loading, setLoading] = useState(false);

  const currentCpu = windows.cpu.data.length ? windows.cpu.data.at(-1).loadPct : 0;
  const lastMemory = windows.memory.data.at(-1);
  const currentDelay = windows.delay.data.length ? windows.delay.data.at(-1).avgMs : 0;
  const lastPacketLoss = windows.packetLoss.data.at(-1);
  const currentPacketLossPct = lastPacketLoss?.packetSent
    ? ((lastPacketLoss.packetSent - lastPacketLoss.packetReceive) / lastPacketLoss.packetSent) * 100
    : 0;
  const packetStats = computePacketLossStats(windows.packetLoss.data);
  const displayEvents = isRealtime ? events : historyEvents;
  const displayIndications = isRealtime ? indications : historyIndications;
  const activeEventsCount = events.filter(e => e.status === 'active').length;
  const activeIndicationsCount = indications.filter(i => i.status === 'active').length;

  useEffect(() => {
    getStatus().then(res => {
      if (res?.ok && res.running) {
        setIsLoggedIn(true);
        if (res.router) setRouter(buildRouter(res.router));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !router.ip) return;
    const socket = initSocket();
    socket.on('snapshot', (data) => {
      if (data.router) setRouter(buildRouter(data.router));
      setUptime(data.uptime || '');
      setPingTarget(data.pingTarget || '');
      setWindows({
        cpu: data.windows?.cpu || INITIAL_WINDOWS.cpu,
        memory: data.windows?.memory || INITIAL_WINDOWS.memory,
        delay: data.windows?.delay || INITIAL_WINDOWS.delay,
        packetLoss: data.windows?.packetLoss || INITIAL_WINDOWS.packetLoss,
      });
      setInterfaces(data.interfaces || []);
      setEvents(data.events || []);
      setIndications(data.indications || []);
    });
    return () => {
      socket.off('snapshot');
      disconnectSocket();
    };
  }, [isLoggedIn, router.ip]);

  useEffect(() => {
    if (!isRealtime && router.ip) {
      setLoading(true);
      Promise.all([getHistoryEvents(router.ip), getHistoryIndications(router.ip)])
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
      if (res?.ok && res.router) {
        setIsLoggedIn(true);
        setRouter(buildRouter(res.router));
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
    setRouter(INITIAL_ROUTER);
    setUptime('');
    setPingTarget('');
    setWindows(INITIAL_WINDOWS);
    setInterfaces([]);
    setEvents([]);
    setIndications([]);
    setHistoryEvents([]);
    setHistoryIndications([]);
    disconnectSocket();
  };

  if (!isLoggedIn) return <LoginForm onLogin={handleLogin} />;

  return (
    <section className="bg-gray-100 min-h-screen p-4">
      <div className="container mx-auto">
        <RouterInfo router={router} uptime={uptime} onLogout={handleLogout} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h5 className="font-bold text-xl text-gray-800 mb-3">Resource Usage</h5>
            <div className="h-48">
              <ResourceChart cpuData={windows.cpu.data} memData={windows.memory.data} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-3">CPU</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-mono">{currentCpu.toFixed(2)}%</span>
                  <span className="text-gray-600">Average:</span>
                  <span className="font-mono">{windows.cpu.stats.avg ?? 0}%</span>
                  <span className="text-gray-600">Minimum:</span>
                  <span className="font-mono">{windows.cpu.stats.min ?? 0}%</span>
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-mono">{windows.cpu.stats.max ?? 0}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-3">Memory</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-mono">{router.total_memory} MB</span>
                  <span className="text-gray-600">Used:</span>
                  <span className="font-mono">{lastMemory?.usedMem?.toFixed(2) ?? 0} MB ({lastMemory?.usedMemPct?.toFixed(2) ?? 0}%)</span>
                  <span className="text-gray-600">Free:</span>
                  <span className="font-mono">{lastMemory?.freeMem?.toFixed(2) ?? 0} MB ({lastMemory?.freeMemPct?.toFixed(2) ?? 0}%)</span>
                  <span className="text-gray-600">Avg usage:</span>
                  <span className="font-mono">{windows.memory.stats.avg ?? 0}%</span>
                  <span className="text-gray-600">Min usage:</span>
                  <span className="font-mono">{windows.memory.stats.min ?? 0}%</span>
                  <span className="text-gray-600">Max usage:</span>
                  <span className="font-mono">{windows.memory.stats.max ?? 0}%</span>
                </div>
              </div>
            </div>

            <hr className="my-5" />

            <div className="flex flex-wrap justify-between items-center mb-3">
              <h5 className="font-bold text-xl text-gray-800">QoS Monitoring</h5>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Target Ping: {pingTarget}</span>
            </div>
            <div className="h-48">
              <QosChart packetLossData={windows.packetLoss.data} delayData={windows.delay.data} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-3">Packet Loss</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-600">Current Loss:</span>
                  <span className="font-mono text-red-600 font-medium">{currentPacketLossPct.toFixed(2)}%</span>
                  <span className="text-gray-600">Packets Sent:</span>
                  <span className="font-mono">{packetStats.totalSent}</span>
                  <span className="text-gray-600">Packets Received:</span>
                  <span className="font-mono">{packetStats.totalReceived}</span>
                  <span className="text-gray-600">Packets Lost:</span>
                  <span className="font-mono">{packetStats.totalLoss}</span>
                  <span className="text-gray-600">Loss % (total):</span>
                  <span className="font-mono">{packetStats.lossPct}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-700 mb-3">Delay</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-mono">{currentDelay.toFixed(2)} ms</span>
                  <span className="text-gray-600">Average:</span>
                  <span className="font-mono">{windows.delay.stats.avg ?? 0} ms</span>
                  <span className="text-gray-600">Minimum:</span>
                  <span className="font-mono">{windows.delay.stats.min ?? 0} ms</span>
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-mono">{windows.delay.stats.max ?? 0} ms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col h-full">
            <ToggleSwitch isRealtime={isRealtime} onToggle={() => setIsRealtime(prev => !prev)} />
            {loading && <p className="text-center text-gray-500 py-4">Memuat history...</p>}
            <div className="flex-1 min-h-0 mt-2">
              <IndicationTable indications={displayIndications} activeCount={activeIndicationsCount} showEnded={!isRealtime} />
            </div>
            <div className="flex-1 min-h-0 mt-4">
              <EventTable events={displayEvents} activeCount={activeEventsCount} showEnded={!isRealtime} />
            </div>
          </div>
        </div>

        <InterfaceTable interfaces={interfaces} />
      </div>
    </section>
  );
}

export default App;