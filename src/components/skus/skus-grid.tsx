"use client";

import Link from "next/link";
import type { Sku } from "@chipi-stack/nextjs";

type SkusGridProps = {
    skus: Sku[];
};

export function SkusGrid({ skus }: SkusGridProps) {
    return (
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {skus.map((sku) => (
                <SkuCard key={sku.id} sku={sku} />
            ))}
        </div>
    );
}

function SkuCard({ sku }: { sku: Sku }) {
    return (
        <Link
            href={`/skus/${sku.id}`}
            className="flex h-36 flex-col justify-between rounded-lg border p-4 hover:border-orange-600"
        >
            <span className="line-clamp-2 text-sm">{sku.name}</span>
            {sku.fixedAmount && (
                <span className="font-bold">${sku.fixedAmount} mxn</span>
            )}
        </Link>
    );
}
