"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { photosApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

interface Photo {
  _id: string;
  url: string;
  type: string;
  createdAt: string;
  employeeId: { fullname: string };
}

export default function PhotosPage() {
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos", "profile"],
    queryFn: () => photosApi.list({ type: "profile" }).then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Xodimlar rasmlari"
        description="Admin tomonidan yuklangan xodim profil rasmlari"
      />

      {isLoading ? (
        <Card>
          <p className="py-8 text-center text-[var(--ink-faint)]">Yuklanmoqda...</p>
        </Card>
      ) : photos.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--ink-faint)]">
            <Camera className="h-6 w-6" />
          </div>
          <p className="font-medium text-[var(--ink)]">Rasmlar topilmadi</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Xodimlar bo&apos;limida yangi xodim qo&apos;shganda rasm yuklang
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo: Photo) => (
            <Card key={photo._id} className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}${photo.url}`}
                alt={photo.employeeId?.fullname || "Xodim"}
                className="h-44 w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">
                  {photo.employeeId?.fullname || "Noma'lum"}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Profil — {formatDate(photo.createdAt)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
