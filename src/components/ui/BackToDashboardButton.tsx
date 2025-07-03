import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function BackToDashboardButton({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={`w-full max-w-2xl mx-auto flex justify-end mt-6 mb-2 ${className}`}>
      <Link href="/dashboard">
        <Button variant="outline">
          ← {t('backToDashboard', 'Volver al Panel')}
        </Button>
      </Link>
    </div>
  );
}
