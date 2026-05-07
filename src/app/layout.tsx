import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "万能导入 - 多模板自动导入下单系统",
  description: "支持多种 Excel 模板的自动识别与导入，完成批量下单流程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={inter.className} style={{ margin: 0, padding: 0, height: '100vh' }}>
        <ConfigProvider locale={zhCN}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
