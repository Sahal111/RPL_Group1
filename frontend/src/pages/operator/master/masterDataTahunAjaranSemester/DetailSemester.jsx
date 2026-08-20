import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// Helper functions
function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short", 
    year: "numeric",
  });
}

function calcProgress(start, end) {
  if (!start || !end) return 42; // Default 42% sebagai contoh
  const total = Math.round((new Date(end) - new Date(start)) / 86400000);
  if (!total) return 42;
  const remaining = Math.round((new Date(end) - new Date()) / 86400000);
  const elapsed = total - Math.max(0, remaining);
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

function daysBetween(a, b) {
  if (!a || !b) return 159; // Default value
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function daysRemaining(end) {
  if (!end) return 124; // Default value
  return Math.round((new Date(end) - new Date()) / 86400000);
}

// Skeleton component
function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9] p-4">
      <div className="animate-pulse space-y-8">
        <div className="h-52 bg-gray-200 rounded-[2.5rem]"></div>
        <div className="h-72 bg-gray-200 rounded-[2.5rem]"></div>
      </div>
    </div>
  );
}

export default function DetailSemester() {
  // Load external resources
  useEffect(() => {
    // Load Tailwind CSS
    if (!document.getElementById('tailwind-css')) {
      const script = document.createElement('script');
      script.id = 'tailwind-css';
      script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
      document.head.appendChild(script);
    }

    // Load fonts
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Load Material Symbols
    if (!document.getElementById('material-symbols')) {
      const link = document.createElement('link');
      link.id = 'material-symbols';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  const { taId, semesterNama } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["detail-semester", taId, semesterNama],
    queryFn: () => api.get("/operator/master-data/tahun-ajaran/" + taId).then((r) => r.data),
    enabled: !!taId,
  });

  if (isLoading) return <SkeletonPage />;

  if (!data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8faf9' }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">calendar_today</span>
          <p className="text-gray-600 mb-4">Data semester tidak ditemukan</p>
          <button 
            onClick={() => navigate("/operator/master/tahun-ajaran")}
            className="text-blue-600 hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const ta = data.data;
  const semesters = ta.semesters || [];
  const semester = semesters.find(s => s.nama?.toLowerCase() === semesterNama?.toLowerCase());
  
  if (!semester) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8faf9' }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">event_busy</span>
          <p className="text-gray-600 mb-4">Semester "{semesterNama}" tidak ditemukan</p>
          <button 
            onClick={() => navigate("/operator/master/tahun-ajaran/" + taId)}
            className="text-blue-600 hover:underline"
          >
            ← Kembali ke Tahun Ajaran
          </button>
        </div>
      </div>
    );
  }

  const progress = calcProgress(semester.tgl_mulai, semester.tgl_selesai);
  const totalHari = daysBetween(semester.tgl_mulai, semester.tgl_selesai);
  const hariSisa = Math.max(0, daysRemaining(semester.tgl_selesai) || 0);
  const hariBerjalan = totalHari ? Math.max(0, totalHari - hariSisa) : 35;
  return (
    <div 
      className="antialiased overflow-x-hidden"
      style={{
        backgroundColor: '#f8faf9',
        color: '#111827',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <style>{`
        body { background-color: #f8faf9; color: #111827; }
        .material-symbols-outlined { 
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
        }
        .icon-fill { 
          font-variation-settings: 'FILL' 1; 
        }
        .blob-bg {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: -1; pointer-events: none;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.05;
        }
        .blob-1 { 
          top: -10%; right: -5%; width: 600px; height: 600px; 
          background-color: #006e2a; 
        }
        .blob-2 { 
          bottom: -10%; left: -10%; width: 800px; height: 800px; 
          background-color: #ffdeac; 
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 24px rgba(0, 52, 43, 0.05);
        }
        .progress-bar-animated {
          position: relative;
          overflow: hidden;
        }
        .progress-bar-animated::after {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(100%); } 
        }
        .pulse-dot {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 52, 43, 0.1);
        }
      `}</style>
      
      {/* Atmospheric Background */}
      <div className="blob-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-8 pb-24 mx-auto pt-8" style={{ maxWidth: '1280px' }}>
        
        {/* Section: Header */}
        <section className="mb-12 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 backdrop-blur-lg p-8 rounded-[2.5rem] shadow-xl overflow-hidden mb-10 relative"
               style={{ backgroundColor: 'rgba(248, 250, 249, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div className="absolute -left-8 -top-5 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                 style={{ backgroundColor: 'rgba(105, 255, 135, 0.1)' }}></div>
            <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
              
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap mb-2">
                <Link to="/operator/master/tahun-ajaran" className="hover:text-blue-600 transition-colors">
                  Tahun Ajaran
                </Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <Link to={"/operator/master/tahun-ajaran/" + taId} className="hover:text-blue-600 transition-colors">
                  {ta.tahun}
                </Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-gray-800">Semester {semester.nama}</span>
              </nav>

              {/* Status Badge & Date */}
              <div className="flex items-center gap-4 mb-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm text-[10px] font-bold tracking-widest uppercase"
                      style={{ 
                        backgroundColor: 'rgba(0, 110, 42, 0.1)', 
                        borderColor: 'rgba(0, 110, 42, 0.2)', 
                        color: '#006e2a' 
                      }}>
                  <span className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: '#006e2a' }}></span>
                  {semester.is_active ? 'AKTIF' : 'TIDAK AKTIF'}
                </span>
                <div className="h-4 w-[1px]" style={{ backgroundColor: 'rgba(191, 201, 196, 0.3)' }}></div>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(63, 73, 69, 0.7)' }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: 'rgba(0, 52, 43, 0.4)' }}>event_available</span>
                  {fmt(semester.tgl_mulai)} — {fmt(semester.tgl_selesai)}
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.1]"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#00342b' }}>
                {ta.tahun}
                <span className="italic font-normal ml-2" 
                      style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(96, 65, 0, 1)' }}>
                  — Semester {semester.nama}
                </span>
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="relative z-10 flex items-center gap-3">
              <button 
                onClick={() => navigate("/operator/master/tahun-ajaran")}
                className="px-6 py-2.5 backdrop-blur-md border rounded-full font-medium text-sm transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderColor: 'rgba(191, 201, 196, 0.3)',
                  color: '#00342b'
                }}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Kembali
              </button>
              
              <button className="px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-500 flex items-center gap-2 group"
                      style={{ 
                        background: 'linear-gradient(to right, #00342b, #004d40)',
                        color: 'white',
                        boxShadow: '0 10px 25px -5px rgba(0, 52, 43, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.boxShadow = '0 20px 35px -5px rgba(105, 255, 135, 0.3)';
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 52, 43, 0.3)';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.filter = 'brightness(1)';
                      }}>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">edit_square</span>
                Edit Semester
              </button>
              
              <button className="w-12 h-12 backdrop-blur-md border rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        borderColor: 'rgba(191, 201, 196, 0.3)',
                        color: '#00342b'
                      }}>
                <span className="material-symbols-outlined text-[24px]">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden border group hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ease-out"
               style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[80px] -mr-32 -mt-32"
                 style={{ backgroundColor: 'rgba(0, 110, 42, 0.05)' }}></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-opacity-20 transition-all duration-300"
                         style={{ backgroundColor: 'rgba(0, 110, 42, 0.1)', color: '#006e2a' }}>
                      <span className="material-symbols-outlined icon-fill text-[24px]">trending_up</span>
                    </div>
                    <h3 className="text-[28px] font-extrabold tracking-tight leading-none"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#00342b' }}>
                      Semester Progress
                    </h3>
                  </div>
                  <p className="text-[15px] font-medium pl-1" style={{ color: 'rgba(63, 73, 69, 0.7)' }}>
                    Real-time tracking of academic milestones and curriculum timeline
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="backdrop-blur-md border rounded-2xl p-4 shadow-sm flex items-center gap-5"
                       style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(255, 255, 255, 0.8)' }}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                            style={{ color: 'rgba(63, 73, 69, 0.5)' }}>
                        Current Progress
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tighter group-hover:text-blue-600 transition-colors duration-300"
                              style={{ color: '#00342b' }}>
                          {progress}
                        </span>
                        <span className="text-lg font-bold" style={{ color: '#006e2a' }}>%</span>
                      </div>
                    </div>
                    <div className="w-px h-10" style={{ backgroundColor: 'rgba(191, 201, 196, 0.2)' }}></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                           style={{ 
                             backgroundColor: 'rgba(0, 115, 44, 0.3)', 
                             borderColor: 'rgba(0, 110, 42, 0.1)' 
                           }}>
                        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ backgroundColor: '#006e2a' }}></span>
                        <span className="text-[10px] font-black uppercase tracking-wider"
                              style={{ color: '#00732c' }}>
                          On Track
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: 'rgba(63, 73, 69, 0.6)' }}>calendar_month</span>
                        <span className="text-[11px] font-bold uppercase tracking-tight"
                              style={{ color: 'rgba(63, 73, 69, 0.7)' }}>
                          {semester.nama} {ta.tahun?.split('/')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-12">
                <div className="relative h-3 rounded-full overflow-hidden shadow-inner"
                     style={{ backgroundColor: 'rgba(225, 227, 226, 0.3)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full progress-bar-animated transition-shadow duration-500"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(to right, #00342b, #006e2a, #69ff87)',
                      boxShadow: '0 0 15px rgba(0, 110, 42, 0.3)'
                    }}
                  ></div>
                </div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-white rounded-full border-4 shadow-lg z-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    left: `${progress}%`, 
                    borderColor: '#006e2a' 
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ backgroundColor: '#006e2a' }}></div>
                </div>
              </div>
              {/* Date Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Start Date Card */}
                <div className="relative backdrop-blur-md rounded-2xl p-6 border border-l-4 shadow-sm flex items-center gap-5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-default group overflow-hidden"
                     style={{ 
                       background: 'linear-gradient(to bottom right, white, rgba(0, 110, 42, 0.05))',
                       borderColor: 'rgba(191, 201, 196, 0.2)',
                       borderLeftColor: '#006e2a'
                     }}>
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(#006e2a 0.5px, transparent 0.5px)',
                    backgroundSize: '10px 10px'
                  }}></div>
                  <div className="relative z-10 w-12 h-12 rounded-xl backdrop-blur-md border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                       style={{ 
                         backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                         borderColor: 'rgba(255, 255, 255, 0.8)',
                         color: '#006e2a',
                         boxShadow: '0 4px 12px rgba(0, 110, 42, 0.15)'
                       }}>
                    <span className="material-symbols-outlined text-[24px] icon-fill">calendar_today</span>
                  </div>
                  <div className="relative z-10 flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                       style={{ color: '#006e2a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Mulai
                    </p>
                    <h4 className="text-xl font-extrabold tracking-tight"
                        style={{ color: '#00342b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {fmt(semester.tgl_mulai)}
                    </h4>
                  </div>
                </div>

                {/* Current Status Card */}
                <div className="rounded-2xl p-6 border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-default group"
                     style={{ backgroundColor: '#00342b', borderColor: 'rgba(0, 110, 42, 0.2)' }}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl"
                       style={{ backgroundColor: 'rgba(0, 110, 42, 0.2)' }}></div>
                  <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3"
                         style={{ 
                           backgroundColor: 'rgba(0, 110, 42, 0.2)', 
                           borderColor: 'rgba(0, 110, 42, 0.3)', 
                           color: '#5cfd80' 
                         }}>
                      <span className="w-1.5 h-1.5 rounded-full mr-2 pulse-dot" style={{ backgroundColor: '#5cfd80' }}></span>
                      Hari Ini
                    </div>
                    <div className="text-white font-extrabold text-3xl leading-none mb-1 tracking-tight"
                         style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Day {hariBerjalan}
                      <span className="italic font-normal text-lg ml-1"
                            style={{ fontFamily: 'EB Garamond, serif', color: '#5cfd80' }}>
                        of {totalHari}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider mt-2"
                         style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {hariSisa} days remaining
                    </div>
                  </div>
                </div>
                {/* End Date Card */}
                <div className="relative backdrop-blur-md rounded-2xl p-6 border border-r-4 shadow-sm flex items-center gap-5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-default group justify-end text-right overflow-hidden"
                     style={{ 
                       background: 'linear-gradient(to bottom left, white, rgba(0, 52, 43, 0.05))',
                       borderColor: 'rgba(191, 201, 196, 0.2)',
                       borderRightColor: '#00342b'
                     }}>
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(#00342b 0.5px, transparent 0.5px)',
                    backgroundSize: '10px 10px'
                  }}></div>
                  <div className="relative z-10 flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                       style={{ color: '#00342b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Selesai
                    </p>
                    <h4 className="text-xl font-extrabold tracking-tight"
                        style={{ color: '#00342b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {fmt(semester.tgl_selesai)}
                    </h4>
                  </div>
                  <div className="relative z-10 w-12 h-12 rounded-xl backdrop-blur-md border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                       style={{ 
                         backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                         borderColor: 'rgba(255, 255, 255, 0.8)',
                         color: '#00342b',
                         boxShadow: '0 4px 12px rgba(0, 52, 43, 0.15)'
                       }}>
                    <span className="material-symbols-outlined text-[24px] icon-fill">flag</span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* Section: Academic Summary */}
        <section className="mb-16">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#006e2a' }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#006e2a' }}></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#006e2a' }}>Live Data</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent"></div>
            </div>
            <h2 className="font-extrabold tracking-tight text-3xl md:text-4xl" 
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#00342b' }}>
              Statistics 
              <span className="italic font-normal" 
                    style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(96, 65, 0, 0.7)' }}>
                Overview
              </span>
            </h2>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            <div className="md:col-span-4 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
                 style={{ backgroundColor: '#00342b', boxShadow: '0 20px 50px rgba(0, 200, 83, 0.15)' }}>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" 
                   style={{ color: 'rgba(148, 211, 193, 0.8)' }}>
                  Active Students
                </p>
                <h4 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  1,248
                </h4>
                <div className="mt-4 h-10 w-full flex items-end gap-1">
                  <div className="flex-1 rounded-t-sm group-hover:animate-pulse" 
                       style={{ height: '40%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
                  <div className="flex-1 rounded-t-sm group-hover:animate-pulse" 
                       style={{ height: '60%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
                  <div className="flex-1 rounded-t-sm group-hover:animate-pulse" 
                       style={{ height: '50%', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}></div>
                  <div className="flex-1 rounded-t-sm group-hover:animate-pulse" 
                       style={{ height: '90%', backgroundColor: '#69ff87' }}></div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-7xl">groups</span>
              </div>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Active Teachers", value: "84", sub: "100% Active", subColor: "#006e2a", icon: "check_circle" },
                { label: "Classes", value: "24", sub: "Current Term", subColor: "#6b7280", icon: null },
                { label: "Subjects", value: "18", sub: "Curriculum", subColor: "#6b7280", icon: null },
                { label: "Schedules", value: "156", sub: "95% Set", subColor: "#006e2a", icon: "verified" }
              ].map((m, index) => (
                <div key={index} className="backdrop-blur-md border rounded-3xl p-4 md:p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
                     style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                     style={{ color: '#6b7280' }}>
                    {m.label}
                  </p>
                  <h4 className="text-xl md:text-2xl font-extrabold"
                      style={{ color: '#00342b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {m.value}
                  </h4>
                  <p className="text-[10px] font-bold mt-2 flex items-center gap-1" style={{ color: m.subColor }}>
                    {m.icon && <span className="material-symbols-outlined text-xs">{m.icon}</span>}
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}