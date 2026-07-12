import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { Megaphone, Filter, Calendar, Tag, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const KATEGORI_OPTIONS = [
  { value: "semua", label: "Semua Kategori" },
  { value: "Penting", label: "Penting" },
  { value: "Libur", label: "Libur" },
  { value: "Rapat", label: "Rapat" },
  { value: "Jadwal Ujian", label: "Jadwal Ujian" },
  { value: "Kegiatan", label: "Kegiatan" },
  { value: "Informasi", label: "Informasi" },
];

const KATEGORI_STYLE = {
  Penting: "bg-red-100 text-red-700 border-red-200",
  Libur: "bg-green-100 text-green-700 border-green-200",
  Rapat: "bg-blue-100 text-blue-700 border-blue-200",
  "Jadwal Ujian": "bg-purple-100 text-purple-700 border-purple-200",
  Kegiatan: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Informasi: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function PengumumanOrtu() {
  const [kategori, setKategori] = useState("semua");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ortu-pengumuman", kategori, page],
    queryFn: () =>
      api
        .get(`/ortu/pengumuman`, { 
          params: { 
            kategori: kategori !== "semua" ? kategori : undefined,
            page 
          } 
        })
        .then((res) => res.data.data),
    keepPreviousData: true,
  });

  const pengumuman = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    total: data?.total || 0,
    per_page: data?.per_page || 10,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-indigo-600" />
            Pengumuman Sekolah
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi terbaru dari sekolah untuk orang tua dan siswa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={kategori}
            onChange={(e) => {
              setKategori(e.target.value);
              setPage(1);
            }}
            className="input max-w-[200px]"
          >
            {KATEGORI_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : isError ? (
        <div className="card text-center py-10 text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p>Gagal memuat pengumuman.</p>
        </div>
      ) : pengumuman.length === 0 ? (
        <div className="card text-center py-12">
          <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Belum ada pengumuman untuk kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pengumuman.map((item) => (
            <div
              key={item.id}
              className="card hover:shadow-lg transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {item.judul}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                          KATEGORI_STYLE[item.kategori] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {item.kategori}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        {dayjs(item.created_at).format("DD MMMM YYYY, HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.konten}
                </p>
              </div>

              {item.lampiran && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Lampiran:</p>
                  <a
                    href={`http://127.0.0.1:8001/storage/${item.lampiran}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    📎 Lihat Lampiran
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between card py-3 bg-gray-50">
              <p className="text-sm text-gray-600">
                Menampilkan {pengumuman.length} dari {pagination.total} pengumuman
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-3">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
                  disabled={page === pagination.last_page}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
