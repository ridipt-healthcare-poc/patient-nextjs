import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Patient Portal - MedSparsh",
    description: "Healthcare digitalized - Patient portal for managing appointments and health records",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
