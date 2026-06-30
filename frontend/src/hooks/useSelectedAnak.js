import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

const STORAGE_KEY = "ortu_selected_nisn";
const EVENT_NAME = "ortu:selected-anak";

export default function useSelectedAnak() {
  const [selectedNisn, setSelectedNisnState] = useState(() =>
    localStorage.getItem(STORAGE_KEY) || "",
  );

  const { data: anak = [], isLoading } = useQuery({
    queryKey: ["ortu-daftar-anak"],
    queryFn: () => api.get("/ortu/daftar-anak").then((res) => res.data.data ?? []),
    retry: false,
  });

  const setSelectedNisn = (nisn) => {
    if (nisn) {
      localStorage.setItem(STORAGE_KEY, nisn);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSelectedNisnState(nisn || "");
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  useEffect(() => {
    if (anak.length === 0) return;

    const exists = anak.some((item) => item.nisn === selectedNisn);
    if (!selectedNisn || !exists) {
      setSelectedNisn(anak[0].nisn);
    }
  }, [anak, selectedNisn]);

  useEffect(() => {
    const sync = () => setSelectedNisnState(localStorage.getItem(STORAGE_KEY) || "");
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  return { anak, selectedNisn, setSelectedNisn, isLoading };
}
