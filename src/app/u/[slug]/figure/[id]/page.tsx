import { notFound } from "next/navigation";
import Link from "next/link";
import { getFigureById, getUserBySlug } from "@/data/figures";
import type { Metadata } from "next";
import EcpayPayment from "@/components/EcpayPayment";
import PaymentBanner from "@/components/PaymentBanner";
import SkeletonImage from "@/components/SkeletonImage";

const ALLOWED_SELLER_SLUG = process.env.ECPAY_SELLER_SLUG;

const BOX_COLORS: Record<string, string> = {
  佳: "bg-emerald-600",
  普通: "bg-yellow-600",
  差: "bg-red-500",
  無盒: "bg-neutral-500",
};

type Props = { params: Promise<{ slug: string; id: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const figure = await getFigureById(id);
  if (!figure) return { title: "找不到模型" };

  const title = `${figure.name} - FigureHub`;
  const description = figure.description ?? `NT$${figure.price} / ${figure.condition}`;
  const firstImage = figure.media.find((m) => m.type === "image");
  const ogImage = firstImage ? `${SITE_URL}${firstImage.url}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/u/${slug}/figure/${id}`,
      siteName: "FigureHub",
      ...(ogImage && { images: [{ url: ogImage, width: 800, height: 800 }] }),
    },
  };
}

export default async function UserFigureDetailPage({ params }: Props) {
  const { slug, id } = await params;

  // 驗證 user 和 figure 存在，且 figure 屬於該 user
  const user = await getUserBySlug(slug);
  if (!user) notFound();

  const figure = await getFigureById(id);
  if (!figure || figure.userId !== user.id) notFound();

  const isNew = figure.condition === "全新未拆";
  const images = figure.media.filter((m) => m.type === "image");
  const videos = figure.media.filter((m) => m.type === "video");

  const firstImage = images[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: figure.name,
    description: figure.description ?? `${figure.condition} / 盒況${figure.boxCondition}`,
    url: `${SITE_URL}/u/${slug}/figure/${id}`,
    ...(firstImage && { image: `${SITE_URL}${firstImage.url}` }),
    offers: {
      "@type": "Offer",
      price: figure.price,
      priceCurrency: "TWD",
      availability:
        figure.soldStatus === "未售出"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      seller: {
        "@type": "Person",
        name: user.name,
      },
    },
    itemCondition: isNew
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 返回 */}
      <Link
        href={`/u/${slug}`}
        className="mb-6 inline-flex items-center gap-1 text-base text-[var(--accent)] hover:underline"
      >
        &larr; 回到 {user.name} 的收藏
      </Link>

      {/* 標題區 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{figure.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-base font-medium text-white ${
              isNew ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
            }`}
          >
            {figure.condition}
          </span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-base font-medium text-white ${
              BOX_COLORS[figure.boxCondition]
            }`}
          >
            盒況{figure.boxCondition}
          </span>
          <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-base font-medium text-white">
            {figure.shippingMethod}
          </span>
          {figure.soldStatus !== "未售出" && (
            <span
              className={`inline-block rounded-full px-3 py-1 text-base font-bold text-white ${
                figure.soldStatus === "已售出" ? "bg-red-600" : "bg-yellow-500"
              }`}
            >
              {figure.soldStatus}
            </span>
          )}
          <span className="text-2xl font-bold text-[var(--accent)]">
            NT${figure.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 銷售方式 Bar */}
      <div className="mb-6 flex items-center gap-0 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-base overflow-hidden">
        <div className="px-4 py-2.5 font-medium text-[var(--foreground)]/60">
          銷售方式
        </div>
        <div
          className={`px-4 py-2.5 font-medium text-white ${
            figure.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
          }`}
        >
          {figure.saleMethod}
        </div>
        {figure.saleMethod === "競標" && (
          <div className="px-4 py-2.5 text-[var(--foreground)]/80">
            結標時間: {figure.bidEndTime ?? "請見貼文"}
          </div>
        )}
      </div>

      {/* 付款結果 Banner */}
      <PaymentBanner />

      {/* 嵌入式付款 — 僅 s780609 賣場 + 未售出 + 功能開啟 */}
      {slug === ALLOWED_SELLER_SLUG &&
        process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD === "true" &&
        figure.soldStatus === "未售出" && (
          <EcpayPayment
            figureId={figure.id}
            figureName={figure.name}
            price={figure.price}
          />
        )}

      {/* 說明 */}
      {figure.description && (
        <p className="mb-8 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 leading-relaxed">
          {figure.description}
        </p>
      )}

      {/* 照片 */}
      {images.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {images.map((m, i) => (
            <div
              key={i}
              className="relative flex items-center justify-center overflow-hidden rounded-lg border border-[var(--card-border)] bg-neutral-100 dark:bg-neutral-800 min-h-[200px]"
            >
              <SkeletonImage
                src={m.url}
                alt={`${figure.name} 照片 ${i + 1}`}
                className="max-w-full h-auto object-contain"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      )}

      {/* 影片 */}
      {videos.length > 0 && (
        <div className="mb-6 grid gap-4">
          {videos.map((m, i) => (
            <div
              key={i}
              className="relative w-full overflow-hidden rounded-lg border border-[var(--card-border)]"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={m.url}
                title={`${figure.name} 影片 ${i + 1}`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
