import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faExclamationTriangle,
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons';
import DeviceConnectionPortal from './components/DeviceConnectionPortal';
import { Html5Qrcode } from 'html5-qrcode';

const HestiaControlPanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.4.74');
  const [port, setPort] = useState('8085');
  const [protocol, setProtocol] = useState<'http' | 'https'>('http');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Check for Errors & Loading Signals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'true') {
      const failedUrl = params.get('failedUrl') || 'Unknown Device';
      setErrorMessage(`Could not reach the device at:\n${failedUrl}\n\nPlease check network and power.`);
      setHasError(true);
      window.history.replaceState({}, document.title, "/");
    }

    const handleLoadingEvent = (event: any) => {
        setIsPanelLoading(event.detail);
        if (event.detail === false) {
            // We only set isConnected true if we didn't just close it
            // Java will signal false when closed too
        }
    };

    const handlePanelClosed = () => {
        setIsConnected(false);
        setIsPanelLoading(false);
    };

    window.addEventListener('panelLoading', handleLoadingEvent);
    window.addEventListener('panelClosed', handlePanelClosed);
    
    return () => {
        window.removeEventListener('panelLoading', handleLoadingEvent);
        window.removeEventListener('panelClosed', handlePanelClosed);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { }); 
      }
    };
  }, []);

  // Scanner Logic
  const startScan = () => { setIsScanning(true); };
  
  useEffect(() => {
    if (!isScanning) return;
    const initScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5Qrcode;
        await html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => { handleQrResult(decodedText); },
          () => { }
        );
      } catch (err) {
        stopScan();
      }
    };
    const timer = setTimeout(initScanner, 300);
    return () => clearTimeout(timer);
  }, [isScanning]);

  const handleQrResult = (rawValue: string) => {
    let processedUrl = rawValue.trim();
    if (!processedUrl.startsWith('http')) processedUrl = 'http://' + processedUrl;
    try {
      const url = new URL(processedUrl);
      const scannedIp = url.hostname;
      const scannedPort = url.port || (url.protocol === 'https:' ? '443' : '80');
      const scannedProtocol = url.protocol.replace(':', '');
      setIpAddress(scannedIp);
      setPort(scannedPort);
      setProtocol(scannedProtocol === 'https' ? 'https' : 'http');
      setTimeout(() => {
        stopScan();
        connectToDevice(scannedIp, scannedPort, scannedProtocol);
      }, 500);
    } catch (e) {
      stopScan();
      showError('Invalid URL or QR format: ' + rawValue);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (e) { }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setHasError(true);
    setIsConnected(false);
    setIsPanelLoading(false);
  };

  const connectToDevice = (ip: string, p: string, protocol: string = 'http') => {
    const url = `${protocol}://${ip}:${p}`;
    setIsPanelLoading(true);
    setIsConnected(true);

    if (window.AndroidBridge) {
        window.AndroidBridge.open(url);
    } else {
        // Fallback for browser testing
        console.log("Opening URL via Bridge:", url);
    }
  };

  const handleConnect = () => {
    if (!ipAddress || !port) {
      showError('Please enter both IP address and port.');
      return;
    }
    setIsRetrying(true);
    setTimeout(() => {
      let manualIp = ipAddress.trim();
      let manualProtocol = protocol;
      if (manualIp.startsWith('https://')) {
        manualProtocol = 'https';
        manualIp = manualIp.replace('https://', '');
      } else if (manualIp.startsWith('http://')) {
        manualProtocol = 'http';
        manualIp = manualIp.replace('http://', '');
      }
      connectToDevice(manualIp, port, manualProtocol);
      setIsRetrying(false);
    }, 300);
  };

  const handleDisconnect = () => {
    if (window.AndroidBridge) {
        window.AndroidBridge.close();
    }
    setIsConnected(false);
    setIsPanelLoading(false);
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-black/80 px-6 pt-10 pb-4 text-center">
          <h2 className="text-white text-xl font-bold flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faQrcode} className="text-white/80" />
            Scan QR Code
          </h2>
        </div>
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div id="qr-reader" className="w-full max-w-sm" />
        </div>
        <div className="bg-black/80 px-6 py-5">
          <button onClick={stopScan} className="w-full py-4 rounded-xl bg-[#ef4444] text-white font-bold text-lg">
            Close Scanner
          </button>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F7FA] z-50 p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#ef4444] px-4 py-2 flex items-center justify-between">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">System Alert</span>
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-xs" />
            </div>
            <div className="p-8 text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-[#ef4444]" />
              </div>
              <h2 className="text-lg font-bold text-[#252F3D] mb-3">Connection Failure</h2>
              <p className="text-xs text-slate-500 whitespace-pre-line mb-8 px-2">{errorMessage}</p>
              <div className="space-y-3">
                <button onClick={() => {setHasError(false); startScan();}} className="w-full py-3 rounded bg-[#252F3D] text-white font-bold text-sm">RETRY SCAN</button>
                <button onClick={() => setHasError(false)} className="w-full py-3 rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm">ABORT & RETURN</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
        {/* ThingsBoard Header */}
        <header className="flex-none bg-[#252F3D] text-white px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 flex items-center justify-between shadow-md z-[100]">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold tracking-tight">SEPLE Connect</h1>
                {isPanelLoading && (
                    <div className="flex items-center gap-2 bg-[#52B5A2]/20 px-2 py-1 rounded">
                        <FontAwesomeIcon icon={faCircleNotch} className="text-[#52B5A2] text-[10px] animate-spin" />
                        <span className="text-[9px] font-bold text-[#52B5A2] uppercase tracking-tighter">Syncing...</span>
                    </div>
                )}
            </div>
            {(isConnected || isPanelLoading) && (
                <button onClick={handleDisconnect} className="bg-[#ef4444] text-[10px] font-bold px-3 py-1.5 rounded uppercase animate-in fade-in duration-300">
                    Exit
                </button>
            )}
        </header>

        <main className="flex-1">
            {(!isConnected && !isPanelLoading) ? (
                <DeviceConnectionPortal
                    ipAddress={ipAddress}
                    setIpAddress={setIpAddress}
                    port={port}
                    setPort={setPort}
                    isRetrying={isRetrying}
                    handleConnect={handleConnect}
                    startScan={startScan}
                    protocol={protocol}
                    setProtocol={setProtocol}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center p-12">
                </div>
            )}
        </main>
    </div>
  );
};

export default HestiaControlPanel;
