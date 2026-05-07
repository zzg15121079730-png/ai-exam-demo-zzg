"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Input, Button, Space, Tag } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waybills?page=${p}&search=${encodeURIComponent(s)}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleTableChange = (pagination: any) => {
    fetchHistory(pagination.current, search);
  };

  const columns = [
    {
      title: '外部编码',
      dataIndex: 'externalCode',
      key: 'externalCode',
      render: (text: string) => text || '-',
      width: 150,
    },
    {
      title: '收件人',
      key: 'receiver',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.receiverName}</div>
          <div className="text-gray-500 text-xs">{record.receiverPhone}</div>
        </div>
      ),
      width: 150,
    },
    {
      title: '收件地址',
      dataIndex: 'receiverAddress',
      key: 'receiverAddress',
      ellipsis: true,
      width: 200,
    },
    {
      title: '发件人',
      key: 'sender',
      render: (_: any, record: any) => (
        <div>
          <div>{record.senderName}</div>
          <div className="text-gray-500 text-xs">{record.senderPhone}</div>
        </div>
      ),
      width: 150,
    },
    {
      title: '温层 / 重量 / 件数',
      key: 'goodsInfo',
      render: (_: any, record: any) => (
        <Space>
          <Tag color="blue">{record.tempZone}</Tag>
          <span className="text-sm text-gray-500">{record.weight}kg / {record.quantity}件</span>
        </Space>
      ),
      width: 200,
    },
    {
      title: '导入时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
      width: 180,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">已导入运单列表</h1>
          <p className="text-gray-500 text-sm mt-1">查看和检索历史导入记录</p>
        </div>
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />}>返回导入界面</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <Input
          placeholder="搜索外部编码或收件人..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          style={{ width: 300 }}
          allowClear
        />
        <div className="text-sm text-gray-500">
          共查询到 <span className="font-semibold text-gray-800">{total}</span> 条记录
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table
          columns={columns}
          dataSource={items.map((item) => ({ ...item, key: item.id }))}
          pagination={{
            current: page,
            total: total,
            pageSize: 20,
            showSizeChanger: false,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}
