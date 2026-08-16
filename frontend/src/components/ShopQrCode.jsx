import { Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ShopQrCode() {
  const shopUrl = `${window.location.origin}/shop`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shopUrl);
  };

  return (
    <section className="rounded-[24px] border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/30">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <QRCodeSVG value={shopUrl} size={132} level="M" includeMargin />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-violet-600" /><h3 className="font-semibold">Customer shop QR code</h3></div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Customers can scan this code to view live availability and the current queue without signing in.</p>
          <button onClick={copyLink} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-300 px-3 py-2 text-sm font-medium text-violet-700 dark:border-violet-700 dark:text-violet-300"><Copy className="h-4 w-4" />Copy shop link</button>
        </div>
      </div>
    </section>
  );
}
