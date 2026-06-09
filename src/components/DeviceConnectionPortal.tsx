import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faQrcode,
    faCircleNotch,
    faArrowRight,
    faWifi,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';

interface DeviceConnectionPortalProps {
    ipAddress: string;
    setIpAddress: (val: string) => void;
    port: string;
    setPort: (val: string) => void;
    isRetrying: boolean;
    handleConnect: () => void;
    startScan: () => void;
    protocol: 'http' | 'https';
    setProtocol: (val: 'http' | 'https') => void;
}

const DeviceConnectionPortal: React.FC<DeviceConnectionPortalProps> = ({
    ipAddress, setIpAddress,
    port, setPort,
    isRetrying,
    handleConnect,
    startScan,
    protocol,
    setProtocol,
}) => {
    const [showManual, setShowManual] = useState(false);

    return (
        <div className="font-sans flex flex-col bg-[#F5F7FA]">
            <main className="px-6 py-8 flex-1 flex flex-col max-w-md mx-auto w-full space-y-6">
                
                {/* Introduction */}
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-[#252F3D]">Device Connectivity</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        Smart Device & System Management
                    </p>
                </div>

                {/* QR Scanner Card */}
                <section>
                    <button
                        onClick={startScan}
                        className="w-full rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden active:scale-[0.99] transition-all group"
                    >
                        <div className="bg-[#52B5A2] px-4 py-2 flex items-center justify-between">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Connection Gateway</span>
                            <FontAwesomeIcon icon={faQrcode} className="text-white/80 text-xs" />
                        </div>

                        <div className="p-8 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-lg bg-slate-50 border-2 border-dashed border-[#52B5A2]/30 flex items-center justify-center group-hover:bg-[#52B5A2]/5 transition-colors">
                                <FontAwesomeIcon icon={faQrcode} className="text-4xl text-[#52B5A2]" />
                            </div>

                            <div className="text-center">
                                <span className="text-lg font-bold text-[#252F3D] block">Connect your Device</span>
                                <span className="text-xs text-slate-500 mt-2 block leading-relaxed px-4">
                                    Securely pair your hardware by scanning the identification code on the system panel.
                                </span>
                            </div>

                            <div className="w-full py-3 bg-[#52B5A2] text-white text-sm font-bold rounded flex items-center justify-center gap-2 group-hover:bg-[#46a08f] transition-colors shadow-sm uppercase tracking-widest">
                                TAP TO SCAN
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </div>
                        </div>
                    </button>
                </section>

                {/* Manual Connection */}
                <section>
                    <button
                        onClick={() => setShowManual(!showManual)}
                        className="w-full flex items-center justify-between px-2"
                    >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">MANUAL CONNECTION</span>
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${showManual ? 'bg-[#252F3D] text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`text-[10px] transition-transform duration-300 ${showManual ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${showManual ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#252F3D] uppercase tracking-wider">Connection Protocol</label>
                                <div className="flex rounded-md bg-slate-100 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setProtocol('http')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${protocol === 'http' ? 'bg-white text-[#252F3D] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        HTTP (Unsecured)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProtocol('https')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${protocol === 'https' ? 'bg-[#52B5A2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        HTTPS (Secured)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#252F3D] uppercase tracking-wider">IP Address</label>
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-[#252F3D] text-sm font-mono focus:outline-none focus:border-[#52B5A2]"
                                    placeholder="192.168.1.1"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#252F3D] uppercase tracking-wider">Service Port</label>
                                <input
                                    type="text"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-[#252F3D] text-sm font-mono focus:outline-none focus:border-[#52B5A2]"
                                    placeholder="8085"
                                />
                            </div>

                            <button
                                onClick={() => handleConnect()}
                                disabled={isRetrying}
                                className="w-full py-3 bg-[#252F3D] text-white text-sm font-bold rounded active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:bg-[#1a222c]"
                            >
                                {isRetrying ? (
                                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                                ) : (
                                    <>ESTABLISH CONNECTION <FontAwesomeIcon icon={faArrowRight} className="text-xs" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mt-auto">
                    <div className="bg-[#E9EDF2] border-l-4 border-[#252F3D] px-4 py-3 flex items-center gap-3">
                        <FontAwesomeIcon icon={faWifi} className="text-[#252F3D] text-sm" />
                        <p className="text-[11px] text-[#252F3D] leading-tight font-medium">
                            SYSTEM STATUS: <span className="text-slate-500 font-normal">Ensure smartphone is linked to the panel's local network for discovery.</span>
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DeviceConnectionPortal;
