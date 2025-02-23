import React, { PureComponent, Fragment, useState, useEffect } from 'react';
import { Button, notification, Modal, Table, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import config from '@/utils/config';
import { PageContainer } from '@ant-design/pro-layout';
import { request } from '@/utils/http';
import QRCode from 'qrcode.react';
import CookieModal from './modal';

enum Status {
  '正常',
  '失效',
  '状态异常',
}
enum StatusColor {
  'success',
  'error',
  'warning',
}

const Config = () => {
  const columns = [
    {
      title: '用户名',
      dataIndex: 'pin',
      key: 'pin',
      align: 'center' as const,
      render: (text: string, record: any) => {
        return <span>{decodeURIComponent(text)}</span>;
      },
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      align: 'center' as const,
    },
    {
      title: '值',
      dataIndex: 'cookie',
      key: 'cookie',
      align: 'center' as const,
      width: '50%',
      render: (text: string, record: any) => {
        return (
          <span
            style={{
              textAlign: 'left',
              display: 'inline-block',
              wordBreak: 'break-all',
            }}
          >
            {text}
          </span>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center' as const,
      render: (text: string, record: any) => {
        return (
          <Space size="middle">
            <Tag color={StatusColor[record.status]}>
              {Status[record.status]}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (text: string, record: any, index: number) => (
        <Space size="middle">
          <EditOutlined onClick={() => editCookie(record, index)} />
          <DeleteOutlined onClick={() => deleteCookie(record, index)} />
        </Space>
      ),
    },
  ];
  const [width, setWdith] = useState('100%');
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginTop, setMarginTop] = useState(-72);
  const [value, setValue] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedCookie, setEditedCookie] = useState();

  const getCookies = () => {
    setLoading(true);
    request
      .get(`${config.apiPrefix}cookies`)
      .then((data: any) => {
        setValue(data.data);
      })
      .finally(() => setLoading(false));
  };

  function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const showQrCode = (oldCookie?: string) => {
    request.get(`${config.apiPrefix}qrcode`).then(async (data) => {
      if (data.qrcode) {
        const modal = Modal.info({
          title: '二维码',
          content: (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: -38,
              }}
            >
              <QRCode
                style={{
                  width: 200,
                  height: 200,
                  marginBottom: 10,
                  marginTop: 20,
                }}
                value={data.qrcode}
              />
            </div>
          ),
        });
        getCookie(modal, oldCookie);
      } else {
        notification.error({ message: '获取二维码失败' });
      }
    });
  };

  const getCookie = async (
    modal: { destroy: () => void },
    oldCookie: string = '',
  ) => {
    for (let i = 0; i < 50; i++) {
      const {
        data: { cookie, errcode, message },
      } = await request.get(`${config.apiPrefix}cookie?cookie=${oldCookie}`);
      if (cookie) {
        notification.success({
          message: 'Cookie获取成功',
        });
        modal.destroy();
        Modal.success({
          title: '获取Cookie成功',
          content: <div>{cookie}</div>,
        });
        getCookies();
        break;
      }
      if (errcode !== 176) {
        notification.error({ message });
        break;
      }
      await sleep(2000);
    }
  };

  const reacquire = async (record: any) => {
    await showQrCode(record.cookie);
  };

  const refreshStatus = (record: any, index: number) => {
    request
      .post(`${config.apiPrefix}cookie/refresh`, {
        data: { cookie: record.cookie },
      })
      .then(async (data: any) => {
        if (data.data && data.data.cookie) {
          (value as any).splice(index, 1, data.data);
          setValue([...(value as any)] as any);
          notification.success({ message: '更新状态成功' });
        } else {
          notification.error({ message: '更新状态失败' });
        }
      });
  };

  const addCookie = () => {
    setIsModalVisible(true);
  };

  const editCookie = (record: any, index: number) => {
    setEditedCookie(record.cookie);
    setIsModalVisible(true);
  };

  const deleteCookie = (record: any, index: number) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除Cookie ${record.cookie} 吗`,
      onOk() {
        request
          .delete(`${config.apiPrefix}cookie`, {
            data: { cookie: record.cookie },
          })
          .then((data: any) => {
            if (data.code === 200) {
              notification.success({
                message: '删除成功',
              });
              getCookies();
            } else {
              notification.error({
                message: data,
              });
            }
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleCancel = (needUpdate?: boolean) => {
    setIsModalVisible(false);
    if (needUpdate) {
      getCookies();
    }
  };

  useEffect(() => {
    if (document.body.clientWidth < 768) {
      setWdith('auto');
      setMarginLeft(0);
      setMarginTop(0);
    } else {
      setWdith('100%');
      setMarginLeft(0);
      setMarginTop(-72);
    }
    getCookies();
  }, []);

  return (
    <PageContainer
      className="code-mirror-wrapper"
      title="Cookie管理"
      loading={loading}
      extra={[
        <Button key="2" type="primary" onClick={() => addCookie()}>
          添加Cookie
        </Button>,
      ]}
      header={{
        style: {
          padding: '4px 16px 4px 15px',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 20,
          marginTop,
          width,
          marginLeft,
        },
      }}
      style={{
        height: '100vh',
      }}
    >
      <Table
        columns={columns}
        pagination={{ hideOnSinglePage: true }}
        dataSource={value}
        rowKey="pin"
        size="middle"
        bordered
        scroll={{ x: 768 }}
      />
      <CookieModal
        visible={isModalVisible}
        handleCancel={handleCancel}
        cookie={editedCookie}
      />
    </PageContainer>
  );
};

export default Config;
