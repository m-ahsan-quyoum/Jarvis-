import React, { useState, useEffect, useRef } from "react";
import { Folder, Send, Terminal, Download, Copy, Play, Monitor, MessageSquare, Clipboard, Check, RefreshCw, Layers } from "lucide-react";
import { translations } from "../translations";

interface TaskAutomationProps {
  language?: "en" | "ur";
  onTriggerVoiceAnnouncement?: (text: string) => void;
  onRewardXP?: (xp: number, message: string) => void;
  externalTrigger?: {
    type: "desktop" | "whatsapp";
    folderName?: string;
    contactName?: string;
    contactPhone?: string;
    messageText?: string;
  } | null;
  onClearExternalTrigger?: () => void;
}

interface SimulatedFolder {
  id: string;
  name: string;
  path: string;
  createdAt: string;
}

interface SimulatedMessage {
  id: string;
  contactName: string;
  phone: string;
  text: string;
  status: "pending" | "typing" | "sending" | "sent" | "delivered";
  timestamp: string;
}

export default function TaskAutomation({
  language = "en",
  onTriggerVoiceAnnouncement,
  onRewardXP,
  externalTrigger = null,
  onClearExternalTrigger
}: TaskAutomationProps) {
  const t = translations[language];

  // Active sub-tool within automation
  const [activeSubTab, setActiveSubTab] = useState<"desktop" | "whatsapp">("desktop");
  
  // Folder State
  const [folderName, setFolderName] = useState("Research Paper - Calculus");
  const [folderPath, setFolderPath] = useState("C:\\Users\\Alex\\Desktop\\StudyFolders");
  const [folders, setFolders] = useState<SimulatedFolder[]>([
    { id: "f1", name: "Chemistry Lab Results", path: "C:\\Users\\Alex\\Desktop\\StudyFolders", createdAt: "10:15 AM" },
    { id: "f2", name: "English Essay Outlines", path: "C:\\Users\\Alex\\Desktop\\StudyFolders", createdAt: "Yesterday" }
  ]);

  // WhatsApp State
  const [contactName, setContactName] = useState("Hiroshi study-cohort");
  const [contactPhone, setContactPhone] = useState("+92 312 4567890");
  const [messageText, setMessageText] = useState("Hey buddy! The AI Coach calibrated a high-strain state for us. Let's study in Accountability Room in 10 mins!");
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    { id: "m1", contactName: "Hiroshi study-cohort", phone: "+92 312 4567890", text: "Starting Calculus review study loop!", status: "delivered", timestamp: "09:12 AM" }
  ]);

  // Terminal Logs Feed
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System shell initialized. Automation Core running...",
    "Ready for high-fidelity folder execution triggers or WhatsApp pipeline commands."
  ]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [animatedCharacters, setAnimatedCharacters] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);
  const desktopEndRef = useRef<HTMLDivElement>(null);

  const addTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${log}`]);
  };

  // Synchronize dynamic AI commands from voice/dialog assistant
  useEffect(() => {
    if (externalTrigger) {
      if (externalTrigger.type === "desktop" && externalTrigger.folderName) {
        setActiveSubTab("desktop");
        setFolderName(externalTrigger.folderName);
        addTerminalLog(`COMMAND RECEIVED: Initiate Folder Creator visually: "${externalTrigger.folderName}"`);
        
        // Auto trigger creation simulation after delay
        const timer = setTimeout(() => {
          setIsExecuting(true);
          addTerminalLog(`EXEC: mkdir -p "${folderPath}\\${externalTrigger.folderName}"`);
          
          setTimeout(() => {
            const newFolder: SimulatedFolder = {
              id: `fold-${Date.now()}`,
              name: externalTrigger.folderName!,
              path: folderPath,
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setFolders(prev => [newFolder, ...prev]);
            addTerminalLog(`STDOUT: Folder "${externalTrigger.folderName}" instantiated on Visual Desktop.`);
            addTerminalLog(`SUCCESS: Target location active. Automation synchronized successfully!`);
            setIsExecuting(false);

            if (onRewardXP) {
              onRewardXP(15, `Desktop Directory Automation: ${externalTrigger.folderName}`);
            }
            if (onTriggerVoiceAnnouncement) {
              onTriggerVoiceAnnouncement(
                language === "ur"
                  ? `جی ہاں! آپ کی ہدایت کے مطابق ڈیسک ٹاپ پر فولڈر "${externalTrigger.folderName}" تیار کر دیا گیا ہے۔`
                  : `Success! digital folder "${externalTrigger.folderName}" created successfully on virtual desktop.`
              );
            }
          }, 1500);
        }, 500);
        
        if (onClearExternalTrigger) {
          onClearExternalTrigger();
        }
        return () => clearTimeout(timer);
      } else if (externalTrigger.type === "whatsapp" && externalTrigger.contactName && externalTrigger.messageText) {
        setActiveSubTab("whatsapp");
        setContactName(externalTrigger.contactName);
        if (externalTrigger.contactPhone) {
          setContactPhone(externalTrigger.contactPhone);
        }
        const parsedMsg = externalTrigger.messageText;
        setMessageText(parsedMsg);
        addTerminalLog(`COMMAND RECEIVED: Send WhatsApp visual: to "${externalTrigger.contactName}" text: "${parsedMsg}"`);
        
        // Auto trigger whatsapp delivery simulation
        const timer = setTimeout(() => {
          setIsExecuting(true);
          setAnimatedCharacters("");
          addTerminalLog(`EXEC: python send_whatsapp_async.py --phone "${externalTrigger.contactPhone || contactPhone}" --contact "${externalTrigger.contactName}"`);
          
          const newMsgId = `whatsapp-${Date.now()}`;
          const newMsg: SimulatedMessage = {
            id: newMsgId,
            contactName: externalTrigger.contactName!,
            phone: externalTrigger.contactPhone || contactPhone,
            text: parsedMsg,
            status: "pending",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [newMsg, ...prev]);

          let charIndex = 0;
          const interval = setInterval(() => {
            if (charIndex < parsedMsg.length) {
              setAnimatedCharacters(prev => prev + parsedMsg.charAt(charIndex));
              charIndex++;
            } else {
              clearInterval(interval);
            }
          }, 15);

          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "typing" } : m));
            addTerminalLog(`STDOUT: Typing message to mimic realistic human keystrokes...`);
          }, 400);

          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "sending" } : m));
            addTerminalLog(`STDOUT: Initializing gateway packet dispatcher...`);
          }, 1200);

          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "sent" } : m));
            addTerminalLog(`STDOUT: Message routed to mobile service provider.`);
          }, 2000);

          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "delivered" } : m));
            addTerminalLog(`SUCCESS: Encrypted double-tick delivered to ${externalTrigger.contactName}!`);
            setIsExecuting(false);

            if (onRewardXP) {
              onRewardXP(20, `WhatsApp Message Dispatched: ${externalTrigger.contactName}`);
            }
            if (onTriggerVoiceAnnouncement) {
              onTriggerVoiceAnnouncement(
                language === "ur"
                  ? `لیجیے! آپ کے دوست ${externalTrigger.contactName} کو کامیابی سے واٹس ایپ پیغام پہنچا دیا گیا ہے۔`
                  : `Notification sent. Message successfully delivered to ${externalTrigger.contactName}.`
              );
            }
          }, 2800);
        }, 500);

        if (onClearExternalTrigger) {
          onClearExternalTrigger();
        }
        return () => clearTimeout(timer);
      }
    }
  }, [externalTrigger]);

  // Trigger creating Simulated Folder on live visual desktop
  const handleExecuteFolderCreation = () => {
    if (!folderName.trim()) return;
    setIsExecuting(true);
    addTerminalLog(`EXEC: mkdir -p "${folderPath}\\${folderName}"`);
    
    // Simulate natural computer processing delay
    setTimeout(() => {
      const newFolder: SimulatedFolder = {
        id: `fold-${Date.now()}`,
        name: folderName,
        path: folderPath,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setFolders(prev => [newFolder, ...prev]);
      addTerminalLog(`STDOUT: Folder "${folderName}" instantiated on Visual Desktop.`);
      addTerminalLog(`SUCCESS: Target location active. Automation synchronized successfully!`);
      setIsExecuting(false);

      if (onRewardXP) {
        onRewardXP(15, `Desktop Directory Automation: ${folderName}`);
      }
      if (onTriggerVoiceAnnouncement) {
        onTriggerVoiceAnnouncement(
          language === "ur"
            ? `زبردست! آپ کی ہدایت کے مطابق ڈیسک ٹاپ کے فولڈر کی تیاری کا عمل مکمل کر دیا گیا ہے۔`
            : `Success! folder "${folderName}" successfully created on your virtual desktop.`
        );
      }
    }, 1500);
  };

  // Simulate WhatsApp natural typing & sending delay
  const handleExecuteWhatsAppSend = () => {
    if (!contactPhone.trim() || !messageText.trim()) return;
    setIsExecuting(true);
    setAnimatedCharacters("");
    addTerminalLog(`EXEC: python send_whatsapp_async.py --phone "${contactPhone}" --contact "${contactName}"`);
    
    // Create new unsent message
    const newMsgId = `whatsapp-${Date.now()}`;
    const newMsg: SimulatedMessage = {
      id: newMsgId,
      contactName,
      phone: contactPhone,
      text: messageText,
      status: "pending",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [newMsg, ...prev]);

    // Simulate natural typing rhythm
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < messageText.length) {
        setAnimatedCharacters(prev => prev + messageText.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "typing" } : m));
      addTerminalLog(`STDOUT: Initializing message typing loop to match human hand dexterity...`);
    }, 400);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "sending" } : m));
      addTerminalLog(`STDOUT: Connected to local gateway server. Forwarding encrypted packet.`);
    }, 1200);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "sent" } : m));
      addTerminalLog(`STDOUT: Message dispatched safely to remote mobile service.`);
    }, 2000);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "delivered" } : m));
      addTerminalLog(`SUCCESS: Double tick delivered check validated! Contact answered.`);
      setIsExecuting(false);

      if (onRewardXP) {
        onRewardXP(20, `WhatsApp Message Dispatched: ${contactName}`);
      }
      if (onTriggerVoiceAnnouncement) {
        onTriggerVoiceAnnouncement(
          language === "ur"
            ? `لو جی! آپ کے دوست ${contactName} کو واٹس ایپ پیغام کامیابی کے ساتھ پہنچا دیا گیا ہے۔`
            : `Notification sent. WhatsApp message successfully queued and delivered to ${contactName}.`
        );
      }
    }, 2800);
  };

  // Generate real, copyable operational Python scripts to run on local computer for actual automation
  const getPythonScriptCode = () => {
    return `import pywhatkit as kit
import os
import time

# Generated by Discipline AI System on ${new Date().toLocaleDateString()}
# This runs actual, fully-functional automation directly on your system!
# Prerequisite: run "pip install pywhatkit" first in your terminal.

contact_phone = "${contactPhone}"
message_to_send = "${messageText.replace(/"/g, '\\"')}"

print(f"[Core Engine] Opening WhatsApp on your browser and preparing delivery to {contact_phone}...")
time.sleep(1)

# Sends the message instantly at current system time, waiting 15 seconds for browser loading
# (Keep WhatsApp Web pre-logged in on your primary browser!)
kit.sendwhatmsg_instantly(
    phone_no=contact_phone,
    message=message_to_send,
    wait_time=15,
    tab_close=True,
    close_time=3
)

print("[Success] Process completed safely!")
`;
  };

  const getPowerShellScriptCode = () => {
    return `# PowerShell Script to generate folders on your Windows computer!
# Copy and run directly in PowerShell to perform this physical action.

$TargetDirectory = "${folderPath.replace(/\\/g, '\\\\')}"
$NewFolderName = "${folderName}"
$FullPath = Join-Path $TargetDirectory $NewFolderName

if (!(Test-Path $FullPath)) {
    New-Item -ItemType Directory -Force -Path $FullPath
    Write-Host "SUCCESS: Fresh academic concentration workspace folder created at $FullPath" -ForegroundColor Green
    # Add a productivity warning text file
    New-Item -ItemType File -Path (Join-Path $FullPath "warning_lock.txt") -Value "Focus mode active. No distraction feeds permitted here." -Force
} else {
    Write-Host "INFO: Target folder already provisioned." -ForegroundColor Yellow
}
`;
  };

  const handleCopyScript = () => {
    const code = activeSubTab === "whatsapp" ? getPythonScriptCode() : getPowerShellScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="bg-[#0B0F17]/95 border border-[#1E293B] rounded-2xl flex flex-col p-5 gap-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Background radial gradient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1E293B]/60 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-100 flex items-center gap-2 tracking-wide uppercase">
            <Layers className="h-5 w-5 text-cyan-400" />
            {language === "ur" ? "ڈیسک ٹاپ اور واٹس ایپ آٹومیشن ڈیسک" : "Desktop & Social Automation Hub"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ur" 
              ? "اے آئی کی مدد سے ہینڈز فری آٹومیشنز چلائیں اور اپنے کمپیوٹر کے لیے حقیقی اسکرپٹس حاصل کریں۔" 
              : "Generate real automated files & social updates that sync with physical scripts."}
          </p>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex bg-[#070a11] border border-[#1E293B]/80 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveSubTab("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeSubTab === "desktop" 
                ? "bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 font-bold" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>{language === "ur" ? "فولڈر آٹومیشن" : "Folder Creator"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("whatsapp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeSubTab === "whatsapp" 
                ? "bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 font-bold" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{language === "ur" ? "واٹس ایپ ڈسپیچر" : "WhatsApp Sender"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* LEFT COMPONENT: CONTROL INPUT FORMS & ACTUAL CODES GENERATED & DOWNLOAD */}
        <div className="flex flex-col bg-[#070a11]/45 border border-[#1E293B] p-4 rounded-xl gap-4 justify-between">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <Terminal className="h-4 w-4 text-emerald-400" />
              {language === "ur" ? "پیرامیٹرز ترتیب دیں" : "Interface Control Inputs"}
            </h3>

            {activeSubTab === "desktop" ? (
              // Option A: Folder Creation Form
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {language === "ur" ? "فولڈر کا نام" : "Academic Folder Name"}
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {language === "ur" ? "کمپیوٹر لوکیشن پاتھ" : "Target System Path"}
                  </label>
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    className="bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-400 font-mono rounded-lg px-3 py-2 outline-none transition"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleExecuteFolderCreation}
                  disabled={isExecuting}
                  className="mt-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transform active:scale-[0.98] transition-all"
                >
                  <RefreshCw className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? (language === "ur" ? "رابطہ بحال ہو رہا ہے..." : "Executing Auto Directory...") : (language === "ur" ? "فولڈر آٹو سسٹم چلائیں" : "Execute Folder Automation")}</span>
                </button>
              </div>
            ) : (
              // Option B: WhatsApp Dispatcher Form
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {language === "ur" ? "نام" : "Contact Nickname"}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {language === "ur" ? "فون نمبر" : "WhatsApp Number + Country.C"}
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-400 font-mono rounded-lg px-3 py-2 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {language === "ur" ? "پیغام کا متن" : "Humanized Message To Dispatch"}
                  </label>
                  <textarea
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none transition resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecuteWhatsAppSend}
                  disabled={isExecuting}
                  className="mt-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transform active:scale-[0.98] transition-all"
                >
                  <Send className={`h-4 w-4 ${isExecuting ? 'animate-bounce' : ''}`} />
                  <span>{isExecuting ? (language === "ur" ? "پیغام بھجوایا جا رہا ہے..." : "Executing Direct Dispatch...") : (language === "ur" ? "قدرتی طریقے سے پیغام بھیجیں" : "Execute WhatsApp Send")}</span>
                </button>
              </div>
            )}
          </div>

          {/* PYTHON / POWERSHELL DOWNLOAD CENTER */}
          <div className="border-t border-[#1E293B] pt-4 mt-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">
                {activeSubTab === "whatsapp" ? "✓ REAL EXECUTABLE PYTHON CODE" : "✓ REAL EXECUTABLE POWERSHELL CODE"}
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 bg-[#0B0F17] border border-[#1E293B] px-2 py-1 rounded-md cursor-pointer transition"
              >
                {copiedScript ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedScript ? (language === "ur" ? "کاپی ہو گیا!" : "Copied!") : (language === "ur" ? "کوڈ نقل کریں" : "Copy Code")}</span>
              </button>
            </div>
            
            <div className="bg-[#090d14] rounded-lg p-2.5 border border-[#1E293B] relative overflow-hidden">
              <pre className="font-mono text-[9px] text-slate-350 leading-normal scrollbar-none max-h-32 overflow-y-auto overflow-x-hidden whitespace-pre-wrap select-text">
                {activeSubTab === "whatsapp" ? getPythonScriptCode() : getPowerShellScriptCode()}
              </pre>
              <div className="absolute bottom-1 right-2 p-1 bg-[#090d14]/80 text-[8px] text-slate-500 font-mono capitalize">
                {activeSubTab === "whatsapp" ? "whatsapp_bot.py" : "workspace_setup.ps1"}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY INTERACTIVE VISUAL STUDY DESKTOP SANDBOX */}
        <div className="flex flex-col bg-gradient-to-b from-[#090d14] to-[#0D131F] border border-[#1E293B] rounded-xl overflow-hidden relative shadow-inner">
          
          {/* Mock Screen Top Bar */}
          <div className="bg-[#0B0F17] border-b border-[#1E293B]/60 p-2.5 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-[10px] font-mono text-slate-400 ml-1.5 uppercase tracking-wider">
                {activeSubTab === "desktop" ? "Visual Workspace Desktop" : "Encrypted Messenger Simulator"}
              </span>
            </div>
            <div className="h-1.5 w-12 rounded-full bg-slate-800"></div>
          </div>

          <div className="p-4 flex flex-col justify-between flex-1 gap-4 min-h-[300px]">
            {activeSubTab === "desktop" ? (
              // Desktop Workspace Folders Box
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-2 select-none relative">
                
                {/* Default folders */}
                <div className="flex flex-col items-center text-center gap-1 group filter drop-shadow-md">
                  <div className="h-12 w-12 rounded-lg bg-indigo-950/45 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-900/30 transition shadow-sm">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <span className="text-[9px] text-slate-300 font-mono font-medium truncate w-16">My Computer</span>
                </div>

                {/* State list mapping folders */}
                {folders.map((f, i) => (
                  <div 
                    key={f.id} 
                    className="flex flex-col items-center text-center gap-1 group cursor-pointer animate-fade-in filter drop-shadow hover:brightness-110"
                    title={`Path: ${f.path}\nCreated: ${f.createdAt}`}
                  >
                    <div className="h-12 w-12 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg relative glow-pulse">
                      <Folder className="h-6 w-6 fill-cyan-400/15" />
                      {i === 0 && isExecuting && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-300 font-mono text-center font-semibold truncate w-16 px-0.5 bg-slate-900/40 rounded">
                      {f.name}
                    </span>
                  </div>
                ))}
                
                {/* Blank desktop spacing empty state overlay */}
                {folders.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-500 text-xs italic font-sans">
                    No directory directories loaded. Run executor on the left.
                  </div>
                )}
              </div>
            ) : (
              // WhatsApp Interactive Messenger Simulator
              <div className="flex flex-col h-full bg-[#05070a] border border-[#1E293B]/70 rounded-lg overflow-hidden flex-1 shadow-inner relative">
                {/* Chat Header */}
                <div className="bg-[#0B0F17] p-2 flex items-center gap-2 border-b border-[#1E293B]/70">
                  <div className="h-7 w-7 rounded-full bg-emerald-950 border border-emerald-500/30 text-[10px] text-emerald-400 flex items-center justify-center font-bold">
                    {contactName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-200 block leading-tight">{contactName}</span>
                    <span className="text-[8px] text-emerald-400 font-mono">online</span>
                  </div>
                </div>

                {/* Chat Feed Box */}
                <div className="p-3 flex flex-col gap-2.5 flex-1 min-h-[160px] max-h-[180px] overflow-y-auto">
                  {messages.map((m, idx) => (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[85%] rounded-lg p-2 text-[10px] ${
                        idx === 0 
                          ? "bg-emerald-950/80 border border-emerald-800/40 text-slate-200 self-end text-right rounded-tr-none" 
                          : "bg-slate-900/90 border border-[#1E293B] text-slate-200 self-start text-left rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-serif">
                        {idx === 0 && isExecuting ? animatedCharacters || "Writing text..." : m.text}
                      </p>
                      <div className="flex justify-end items-center gap-1 text-[8px] font-mono text-slate-500 mt-1">
                        <span>{m.timestamp}</span>
                        <span>
                          {m.status === "pending" && "⏳"}
                          {m.status === "typing" && "✍️ Typing..."}
                          {m.status === "sending" && "✓"}
                          {m.status === "sent" && "✓ Sent"}
                          {m.status === "delivered" && <span className="text-cyan-400 font-bold">✓✓ Delivered</span>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Realtime Linux Shell / PowerShell Terminal logs logger */}
            <div className="bg-black/95 border border-[#1E293B] rounded-lg p-2 flex flex-col gap-1 shadow-inner overflow-hidden max-h-[75px]">
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-0.5">
                <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-widest block">SYSTEM TERMINAL STREAM</span>
                <span className="text-[8px] text-slate-500 font-mono">alex_mac~</span>
              </div>
              <div ref={desktopEndRef} className="overflow-y-auto max-h-[50px] flex flex-col gap-0.5 max-w-full font-mono text-[8px]">
                {terminalLogs.slice(-3).map((log, i) => (
                  <div key={i} className={`truncate ${log.includes("SUCCESS") ? "text-emerald-400 font-semibold" : log.includes("EXEC") ? "text-indigo-400" : "text-slate-400"}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
